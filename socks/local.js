const ip = require('ip');
const _createServer = require('net').createServer;
const connect = require('net').connect;
const getDstInfo = require('./utils').getDstInfo;
const writeOrPause = require('./utils').writeOrPause;
const createCipher = require('./encryptor').createCipher;
const createDecipher = require('./encryptor').createDecipher;
const createUDPRelay = require('./createUDPRelay').createUDPRelay;

function handleMethod(connection, data) {
    // +----+----------+----------+
    // |VER | NMETHODS | METHODS  |
    // +----+----------+----------+
    // | 1  |    1     | 1 to 255 |
    // +----+----------+----------+
    const buf = new Buffer(2);

    if (data.indexOf(0x00, 2) >= 0) {
        buf.writeUInt16BE(0x0500);
        connection.write(buf);
        return 1;
    } else {
        buf.writeUInt16BE(0x05FF);
        connection.write(buf);
        connection.end();
        return -1;
    }
}

function handleRequest(connection, data, {
    serverAddr,
    serverPort,
    password,
    method,
    localAddr,
    localPort,
    localAddrIPv6
}, dstInfo, onConnect, onDestroy, isClientConnected) {
    const cmd = data[1];
    const clientOptions = {
        port: serverPort,
        host: serverAddr
    };
    const isUDPRelay = (cmd === 0x03);

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

    // prepare data

    // +----+-----+-------+------+----------+----------+
    // |VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
    // +----+-----+-------+------+----------+----------+
    // | 1  |  1  | X'00' |  1   | Variable |    2     |
    // +----+-----+-------+------+----------+----------+

    if (isUDPRelay) {
        const isUDP4 = dstInfo.atyp === 1;

        repBuf = new Buffer(4);
        repBuf.writeUInt32BE(isUDP4 ? 0x05000001 : 0x05000004);
        tmp = new Buffer(2);
        tmp.writeUInt16BE(localPort);
        repBuf = Buffer.concat([repBuf, ip.toBuffer(isUDP4 ? localAddr : localAddrIPv6), tmp]);

        connection.write(repBuf);

        return {
            stage: -1,
        };
    }

    repBuf = new Buffer(10);
    repBuf.writeUInt32BE(0x05000001);
    repBuf.writeUInt32BE(0x00000000, 4, 4);
    repBuf.writeUInt16BE(0, 8, 2);

    tmp = createCipher(password, method, data.slice(3)); // skip VER, CMD, RSV
    cipher = tmp.cipher;
    cipheredData = tmp.data;

    // connect
    const clientToRemote = connect(clientOptions, () => onConnect());

    clientToRemote.on('data', (remoteData) => {
        if (!decipher) {
            tmp = createDecipher(password, method, remoteData);
            if (!tmp) {
                onDestroy();
                return;
            }
            decipher = tmp.decipher;
            decipheredData = tmp.data;
        } else {
            decipheredData = decipher.update(remoteData);
        }

        if (isClientConnected()) {
            writeOrPause(clientToRemote, connection, decipheredData);
        } else {
            clientToRemote.destroy();
        }
    });

    clientToRemote.on('drain', () => connection.resume());

    clientToRemote.on('end', () => connection.end());

    clientToRemote.on('error', (e) => onDestroy());

    clientToRemote.on('close', (e) => {
        if (e) {
            connection.destroy();
        } else {
            connection.end();
        }
    });

    // write
    connection.write(repBuf);

    writeOrPause(connection, clientToRemote, cipheredData);

    return {
        stage: 2,
        cipher,
        clientToRemote,
    };
}

function handleConnection(connection, config) {

    let stage = 0;
    let clientToRemote;
    let tmp;
    let cipher;
    let remoteConnected = false;
    let clientConnected = true;
    let timer = null;

    connection.on('data', (data) => {
        switch (stage) {
            case 0:
                stage = handleMethod(connection, data);
                break;
            case 1:
                let dstInfo = getDstInfo(data);
                if (!dstInfo) {
                    connection.destroy();
                    return;
                }
                tmp = handleRequest(connection, data, config, dstInfo,
                    () => {
                        remoteConnected = true;
                    },
                    () => {
                        if (remoteConnected) {
                            remoteConnected = false;
                            clientToRemote.destroy();
                        }
                        if (clientConnected) {
                            clientConnected = false;
                            connection.destroy();
                        }
                    },
                    () => clientConnected
                );
                stage = tmp.stage;
                if (stage === 2) {
                    clientToRemote = tmp.clientToRemote;
                    cipher = tmp.cipher;
                } else {
                    // udp relay
                    clientConnected = false;
                    connection.end();
                }
                break;
            case 2:
                tmp = cipher.update(data);
                writeOrPause(connection, clientToRemote, tmp);
                break;
            default:
                return;
        }
    });

    connection.on('drain', () => {
        if (remoteConnected) {
            clientToRemote.resume();
        }
    });

    connection.on('end', () => {
        clientConnected = false;
        if (remoteConnected) {
            clientToRemote.end();
        }
    });

    connection.on('close', (e) => {
        if (timer) {
            clearTimeout(timer);
        }

        clientConnected = false;

        if (remoteConnected) {
            if (e) {
                clientToRemote.destroy();
            } else {
                clientToRemote.end();
            }
        }
    });

    timer = setTimeout(function () {
        if (clientConnected) {
            connection.destroy();
        }
        if (remoteConnected) {
            clientToRemote.destroy();
        }
    }, config.timeout * 1000);
}

exports.createServer = function (config) {
    const server = _createServer(c => handleConnection(c, config));
    //const udpRelay = createUDPRelay(config, false, logger);

    server.on('close', () => console.log('server close'));
    server.on('error', e => console.log(e));
    server.on('connection', function(){
        console.log('tcp server connected');
    });
    server.on('listening', function(){
        console.log(`TCP listening on ${config.localPort}…`);
    });
    server.listen(config.localPort);
}