const net = require('net')
const ip = require('ip')
const logger = require('../utils/logger')
const createCipher = require('./encrypt').createCipher
const createDecipher = require('./encrypt').createDecipher
const LOCAL_CONF = require('../config/local.json')
/**
 * 和客户端协商版本及认证方式
 * client -> server
 * +----+----------+----------+
 * |VER | NMETHODS | METHODS  |
 * +----+----------+----------+
 * | 1  |    1     | 1 to 255 |
 * +----+----------+----------+
 * VER是SOCKS版本，这里应该是0x05；
 * NMETHODS是METHODS部分的长度；
 * METHODS是客户端支持的认证方式列表，每个方法占1字节。当前的定义是：
 ** 0x00 不需要认证
 ** 0x01 GSSAPI
 ** 0x02 用户名、密码认证
 ** 0x03 - 0x7F由IANA分配（保留）
 ** 0x80 - 0xFE为私人方法保留
 ** 0xFF 无可接受的方法
 * 
 * server -> client
 * +----+----------+
 * |VER | METHOD   | 
 * +----+----------+
 * | 1  |    1     | 
 * +----+----------+
 * @param {object} connection socks 连接
 * @param {buffer} data       tcp(socks)传送的数据
 * @return {boolean}          是否继续通信
 **/
function agreeMode(connection, data) {

    const buf = new Buffer(2)

    if (data.indexOf(0x00, 2) >= 0) { //不需要认证
        buf.writeUInt16BE(0x0500)
        connection.write(buf)
        return true
    } else {
        buf.writeUInt16BE(0x05FF)    //不接受其他方法，客户端需要关闭链接
        connection.write(buf)
        connection.end()
        return false
    }
}

/**
 * @method 与远端建立TCP链接
 * @param {connetion}  localSocksConnect  本地建立的socks连接
 * @param {object} config 
 * @returns
 */
function makeTunnel(localSocksConnect, config) {

    let decipher, decipheredData

    let tunnel = net.connect({ port: config.port, host: config.host })
    tunnel.on('data', (remoteData) => {
        if (!decipher) {
            let tmp = createDecipher(config.password, config.method.toLowerCase(), remoteData)
            if (tmp) {
                decipher = tmp.decipher
                decipheredData = tmp.data
            } else {
                tunnel.destroy()
                localSocksConnect.end()
                return
            }
        } else {
            decipheredData = decipher.update(remoteData)
        }
        flowData(tunnel, localSocksConnect, decipheredData)
    }).on('drain', () => {
        localSocksConnect.resume()
    }).on('end', () => {
        localSocksConnect.end()
        logger.status(`${config.host}:${config.port} connection end`)
    }).on('close', (has_error) => {
        if (has_error) {
            logger.error(`${config.host}:${config.port} close error`)
        }
        localSocksConnect.destroy()
    }).on('error', (err) => {
        logger.error(err)    //connect ECONNREFUSED
    })
    return tunnel
}

/**
 * @method 在tcp上建立会话层SOCKS连接
 * @param {connect} proxy  本地代理链接
 * @param {object} config  配置
 * 向应用层返回状态
 * +----+-----+-------+------+----------+----------+
 * |VER | CMD |  RSV  | ATYP | DST ADDR | DST PROT |
 * +----+-----+-------+------+----------+----------+
 * | 1  |  1  | 0x00  |  1   | Variable |    2     |
 * +----+-----+-------+------+----------+----------+
 * <Buffer 05 01 00 03 11 77 77 77 2e 67 6f 6f 67 6c 65 2e 63 6f 6d 2e 68 6b 01 bb>
 * VER是SOCKS版本，这里应该是0x05；
 * CMD是SOCKS的命令码:0x01表示CONNECT请求,0x02表示BIND请求,0x03表示UDP转发
 * RSV 0x00，保留
 * ATYP 地址类型 0x01 IPv4; 0x03 域名; 0x04 ipv6
 * DST ADDR 目的地址
 * DST PROT 目的端口
 * +----+-----+-------+------+----------+----------+
 * |VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
 * +----+-----+-------+------+----------+----------+
 * | 1  |  1  | 0x00  |  1   | Variable |    2     |
 * +----+-----+-------+------+----------+----------+
 * VER是SOCKS版本，这里应该是0x05；
 * REP应答字段
 ** 0x00表示成功
 ** 0x01普通SOCKS服务器连接失败
 ** 0x02现有规则不允许连接
 ** 0x03网络不可达
 ** 0x04主机不可达
 ** 0x05连接被拒
 ** 0x06 TTL超时
 ** 0x07不支持的命令
 ** 0x08不支持的地址类型
 ** 0x09 - 0xFF未定义
 * RSV 0x00，保留
 * ATYP BND.ADDR地址类型 0x01 IPv4; 0x03 域名; 0x04 ipv6
 * BND ADDR服务器绑定的地址
 * BND PROT网络字节序表示的服务器绑定的端口
 * */
function socksHandle(localSocksConnect, config, port) {

    let stage = 0  //0 协商认证模式，1 返回状态， 2，传输数据 
    let tunnel
    let tmp
    let cipher

    localSocksConnect.on('data', (data) => {
        if (stage == 0) {
            if (agreeMode(localSocksConnect, data)) {
                stage = 1
            }
        } else if (stage == 1) {
            let BND_ADDR = ip.toBuffer(config.host)
            let BND_PROT = new Buffer(2)
            BND_PROT.writeUInt16BE(port)
            let resBuf = new Buffer([0x05, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, BND_ADDR, BND_PROT])
            localSocksConnect.write(resBuf)
            tunnel = makeTunnel(localSocksConnect, config)
            stage = 2
            //向服务端吐数据
            let encrypt = createCipher(config.password, config.method.toLowerCase(), data.slice(3)) // skip VER, CMD, RSV
            cipher = encrypt.cipher
            tunnel.write(encrypt.data)
        } else if (stage == 2) {
            tmp = cipher.update(data)
            flowData(localSocksConnect, tunnel, tmp)
        }
    }).on('drain', () => {
        tunnel.resume()
    }).on('end', () => {
        logger.status('SOCKS connection end')
        if (tunnel) {
            tunnel.end()
        }
    }).on('close', (has_error) => {
        if (has_error) {
            logger.error('SOCKS connection close width error')
        }
        if (tunnel) {
            tunnel.destroy()
        }
    })
}

/**
 * @method 流通数据
 * @param from Socks 数据源
 * @param to   Socks 数据桶
 * @param data Buffer  数据
 * */
function flowData(from, to, data) {
    const res = to.write(data)
    if (!res) {
        from.pause()  //内存边界
    }
    return res
}

exports.createServer = function (arr) {
    let serverList = arr
    let socksServerArr = []
    let ceilPort = parseInt(LOCAL_CONF.proxyPortCeil)
    let host = LOCAL_CONF.host
    for (let i = 0; i < serverList.length; i++) {
        let config = serverList[i]
        let port = ceilPort + i
        let server = net.createServer(c => socksHandle(c, config, port))
        server.on('close', () => {
            logger.error('TCP server close unexpacted')
        }).listen({ host: host, port: port }, function () {
            logger.status(`TCP listening on ${host}:${port}...`)
        })
        socksServerArr.push(port)
    }
    return socksServerArr
}