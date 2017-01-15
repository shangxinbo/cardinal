
const path = require('path');
const http = require('http');
const fs = require('fs');
const exec = require('child_process').exec;
const logger = require('../utils/logger');
const config = require('../config/local.json');

function getProxy() {
    return 'var proxy = "PROXY ' + config.host + ':' + config.httpPort + ';DIRECT;";';
}

function getRules() {
    let ipFromFile = fs.readFileSync(path.join(__dirname, '../config/GeoIP-CN'), 'utf8')
        .split('\n')
        .filter((rx) => {
            return rx.length
        });
    let ipsArr = [];
    for (let i = 0; i < ipFromFile.length; i++) {
        let tmp = ipFromFile[i].split('/');
        ipsArr.push(JSON.stringify({
            ip: tmp[0],
            mask: subNetMask(tmp[1])
        }));
    }

    return 'var ipsArr=[' + ipsArr.join(',') + '];';
}

function subNetMask(num) {
    var str = '';
    for (var i = 0; i < 32; i++) {
        if (i < num) {
            str += '1';
        } else {
            str += '0';
        }
    }
    var arr = [
        str.substr(0, 8),
        str.substr(8, 8),
        str.substr(16, 8),
        str.substr(24, 8)
    ];
    for (var j = 0; j < 4; j++) {
        arr[j] = parseInt(arr[j], 2);
    }
    return arr.join('.');
}

exports.createServer = function () {

    let proxyStr = getProxy();
    let ruleStr = getRules();
    let proxyFunc = fs.readFileSync(path.join(__dirname, '../config/pac.js'), { encoding: 'utf8' });

    fs.writeFileSync('proxy.pac', `${proxyStr}\n${ruleStr}\n${proxyFunc}`);

    return http.createServer(function (req, res) {
        fs.readFile(path.join(__dirname, '../proxy.pac'), 'binary', function (err, file) {
            if (err) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.end(err);
            } else {
                res.write(file, "binary");
                res.end();
            }
        });
    }).listen(config.pacPort, function () {
        logger.status(`pacserver listening on ${config.pacPort}`);
    });
};

exports.addPacUrl = function () {

    //windows set browser proxy auto config script
    const pacUrl = new Buffer(`http://${config.host}:${config.pacPort}/proxy.pac`);
    let cmd = 'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Connections"' +
        ' /v DefaultConnectionSettings /t REG_BINARY /d 46000000d2eb00000500000000000000000000001f000000' +
        pacUrl.toString('hex') +
        '0100000000000000000000000000000000000000000000000000000000000000 /f';
    exec(cmd, function (err, stdout, stderr) {
        if (err) {
            logger.error(err);
        } else {
            logger.status('PAC url set success in OS by reg command');
        }
    });
};

exports.removePacUrl = function (callback) {
    let cmd = 'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Connections"' +
        ' /v DefaultConnectionSettings /t REG_BINARY' +
        ' /d 46000000d1eb0000010000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000 /f';
    exec(cmd, () => { if (callback) callback() });
};


