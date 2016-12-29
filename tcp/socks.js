"use strict";

const ip = require('ip');
const net = require('net');
const createCipher = require('./encrypt').createCipher;
const createDecipher = require('./encrypt').createDecipher;
const logger = require('../logger');

/**
 * 接受客户端发送请求来协商版本及认证方式
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
 * 服务端选择一种验证方式返回给客户端
 **/
function agreeMode(connection, data) {

    const buf = new Buffer(2);

    if (data.indexOf(0x00, 2) >= 0) { //不需要认证
        buf.writeUInt16BE(0x0500);
        connection.write(buf);
        return 1;
    } else {
        buf.writeUInt16BE(0x05FF);    //不接受其他方法，客户端需要关闭链接
        connection.write(buf);
        connection.end();
        return -1;
    }
}

function handleRequest(proxy, {serverAddr, serverPort, password, method}) {

    let decipher, decipheredData;

    // 本地socks和云端socks桥接
    const tunnel = net.connect({port: serverPort, host: serverAddr}, function () {
        logger.status(`Server ${serverAddr}:${serverPort} connected`);
    });
    tunnel.on('data', (remoteData) => {
        if (!decipher) {
            let tmp = createDecipher(password, method, remoteData);
            if (tmp) {
                decipher = tmp.decipher;
                decipheredData = tmp.data;
            } else {
                tunnel.destroy();
                proxy.end();
                return;
            }
        } else {
            decipheredData = decipher.update(remoteData);
        }
        flowData(tunnel, proxy, decipheredData);
    }).on('drain', function () {
        proxy.resume()
    }).on('end', function () {
        proxy.end();
        logger.status('server connection end');
    }).on('close', function (has_error) {
        if(has_error){
            logger.error('server connection close error');
        }
        proxy.destroy();
    });
    return tunnel;
}

/**
 * @method 处理代理请求
 * @param proxy  本地代理链接
 * @param config 配置
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
function handleConnection(proxy, config) {

    let stage = 0;
    let tunnel;
    let tmp;
    let cipher;
    let timer = null;

    proxy.on('data', (data) => {
        if (stage == 0) {
            stage = agreeMode(proxy, data);
        } else if (stage == 1) {
            tunnel = handleRequest(proxy, config);
            let resBuf = new Buffer(10);
            resBuf.writeUInt32BE(0x05000001);
            resBuf.writeUInt32BE(0x00000000, 4, 4);
            resBuf.writeUInt16BE(0, 8, 2);
            proxy.write(resBuf);
            stage = 2;
            //向服务端吐数据
            let encrypt = createCipher(config.password, config.method, data.slice(3)); // skip VER, CMD, RSV
            cipher = encrypt.cipher;
            flowData(proxy, tunnel, encrypt.data);
        } else if (stage == 2) {
            tmp = cipher.update(data);
            flowData(proxy, tunnel, tmp);
        }
    }).on('drain', () => {
        tunnel.resume();
    }).on('end', () => {
        logger.status('tcp connection end');
        if(tunnel){
            tunnel.end();
        }
    }).on('close', (has_error) => {
        if(has_error){
            logger.error('local connection close unexpected');
        }
        tunnel.destroy();
    });

    process.on('uncaughtException', function (err) {
        tunnel.destroy();   //程序异常退出，tcp连接处理
    });
}

/**
 * @method 流通数据
 * @param from Socks 数据源
 * @param to   Socks 数据桶
 * @param data Buffer  数据
 *
* */
function flowData(from,to,data){
    const res = to.write(data);
    if (!res) {
        from.pause();  //内存边界
    }
    return res;
}

exports.createServer = function (config) {
    const server = net.createServer(c => handleConnection(c, config));

    server.on('close', function(){
        logger.error('TCP server close unexpacted');
    });
    server.on('connection', function () {
        logger.doing('TCP server connected');
        var proxyConnects = server.getConnections;
        //logger.status(`TCP have ${proxyConnects} connections`);
    });
    server.on('listening', function () {
        logger.status(`TCP listening on ${config.localPort}...`);
    });
    server.listen(config.localPort);
}