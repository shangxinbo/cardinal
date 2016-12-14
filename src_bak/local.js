/**
 * NAME 2016/12/9
 * DATE 2016/12/9
 * AUTHOR shangxinbo
 */

const net = require('net');
const encryptor = require('./encryptor');
const config = require('../config.json');

function handleMethod(connection, data, authInfo) {
    // +----+----------+----------+
    // |VER | NMETHODS | METHODS  |
    // +----+----------+----------+
    // | 1  |    1     | 1 to 255 |
    // +----+----------+----------+
    const { forceAuth } = authInfo;
    const buf = new Buffer(2);

    let method = -1;

    if (forceAuth && data.indexOf(0x02, 2) >= 0) {
        method = 2;
    }

    if (!forceAuth && data.indexOf(0x00, 2) >= 0) {
        method = 0;
    }

    // allow `no authetication` or any usename/password
    if (method === -1) {
        // logger.warn(`unsupported method: ${data.toString('hex')}`);
        buf.writeUInt16BE(0x05FF);
        connection.write(buf);
        connection.end();
        return -1;
    }

    buf.writeUInt16BE(0x0500);
    connection.write(buf);

    return method === 0 ? 1 : 3;
}
const server = net.createServer(function(connect){
    let stage = 0,tmp;
    let cipher;
    let clientToRemote;
    connect.on('end', function(){
        console.log('client disconnected');
    });
    connect.on('data',function(data){
        if(stage==0){ //验证认证方式
            const buf = new Buffer(2);
            if (data.indexOf(0x02, 2) >= 0){           //用户名密码认证
                buf.writeUInt16BE(0x0502);
                stage = 3;

            }else if (data.indexOf(0x00, 2) >= 0){     //不需要认证
                buf.writeUInt16BE(0x0500);
                stage = 1;
            }else {
                buf.writeUInt16BE(0x05FF);             //没有可用的认证方式，连接终止
                stage = -1;
            }
            connect.write(buf);
        }else if(stage==1){
            console.log(1);
            dstInfo = getDstInfo(data,3);
            tmp = handleRequest(connect, data, config, dstInfo);
            stage = tmp.stage;
            if (stage === 2) {
                clientToRemote = tmp.clientToRemote;
                cipher = tmp.cipher;
            } else {
                // udp relay
                clientConnected = false;
                connection.end();
            }
        }else if(stage==2){
            console.log(2);
            tmp = cipher.update(data);
            writeOrPause(connect, clientToRemote, tmp);

        }else{
            console.log(3);
        }
    });
});

server.on('error', function(err){
    throw err;
});

server.listen(1090, function(){
    console.log('server bound');
});


function handleRequest(connection, data, config, dstInfo) {
    const cmd = data[1];    //仅支持tcp 0x01
    const clientOptions = {
        port: config.server_port,
        host: config.server,
    };
    const isUDPRelay = false;

    let repBuf;
    let tmp = null;
    let decipher = null;
    let decipheredData = null;
    let cipher = null;
    let cipheredData = null;

    if (cmd !== 0x01 && !isUDPRelay) {
        return {
            stage: -1,
        };
    }

    repBuf = new Buffer(10);
    repBuf.writeUInt32BE(0x05000001);
    repBuf.writeUInt32BE(0x00000000, 4, 4);
    repBuf.writeUInt16BE(0, 8, 2);

    // +----+-----+-------+------+----------+----------+
    // |VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
    // +----+-----+-------+------+----------+----------+
    // | 1  |  1  | X'00' |  1   | Variable |    2     |
    // +----+-----+-------+------+----------+----------+

    tmp = encryptor.createCipher(config.password, config.method,data.slice(3));
    cipher = tmp.cipher;
    cipheredData = tmp.data;
    let clientToRemote = net.connect(clientOptions,function(){
        console.log('server connect');
    });
    clientToRemote.on('data', function(remoteData){
        console.log(remoteData);
        if (!decipher) {
            tmp = encryptor.createDecipher(config.password, config.method, remoteData);
            if (!tmp) return;
            decipher = tmp.decipher;
            decipheredData = tmp.data;
        } else {
            decipheredData = decipher.update(remoteData);
        }
        writeOrPause(clientToRemote, connection, decipheredData);
    });
    clientToRemote.on('drain', function(){
        connection.resume();
    });

    clientToRemote.on('end', function() {
        connection.end();
    });

    clientToRemote.on('error', function(e) {
        console.log(e);
    });

    clientToRemote.on('close', function(e){
        if (e) {
            connection.destroy();
        } else {
            connection.end();
        }
    });
    connection.write(repBuf);
    writeOrPause(connection, clientToRemote, cipheredData);
    return {
        stage: 2,
        cipher,
        clientToRemote,
    };
}

function writeOrPause(fromCon, toCon, data) {
    const res = toCon.write(data);

    if (!res) {
        fromCon.pause();
    }

    return res;
}


function getDstInfo(data) {

    // +----+-----+-------+------+----------+----------+
    // |VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
    // +----+-----+-------+------+----------+----------+
    // | 1  |  1  | X'00' |  1   | Variable |    2     |
    // +----+-----+-------+------+----------+----------+
    // Yet shadowsocks begin with ATYP.
    let offset = 3;
    const atyp = data[offset];

    let dstAddr;
    let dstPort;
    let dstAddrLength;
    let dstPortIndex;
    let dstPortEnd;
    let totalLength;

    switch (atyp) {
        case 0x01: //IPv4地址，DST ADDR部分4字节长度
            dstAddrLength = 4;
            dstAddr = data.slice(offset + 1, offset + 5);
            dstPort = data.slice(offset + 5, offset + 7);
            totalLength = offset + 7;
            break;
        case 0x04: //DST ADDR部分第一个字节为域名长度，DST ADDR剩余的内容为域名，没有\0结尾。
            dstAddrLength = 16;
            dstAddr = data.slice(offset + 1, offset + 17);
            dstPort = data.slice(offset + 17, offset + 19);
            totalLength = offset + 19;
            break;
        case 0x03: //IPv6地址，16个字节长度。
            dstAddrLength = data[offset + 1];
            dstPortIndex = 2 + offset + dstAddrLength;
            dstAddr = data.slice(offset + 2, dstPortIndex);
            dstPortEnd = dstPortIndex + 2;
            dstPort = data.slice(dstPortIndex, dstPortEnd);
            totalLength = dstPortEnd;
            break;
        default:
            return null;
    }

    return {
        atyp, dstAddrLength, dstAddr, dstPort, totalLength,
    };
}

