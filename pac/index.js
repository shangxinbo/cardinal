"use strict";

const path = require('path');
const http = require('http');
const fs = require('fs');
const logger = require('../utils/logger');

function getProxy(ports) {
    let str = 'var proxy = "';
    for (var i = 0; i < ports.length; i++) {
        str += 'PROXY 127.0.0.1:' + ports[i] + ';';
    }
    str += 'DIRECT;";';
    return str;
}

function getRules() {
    let ipFromFile = fs.readFileSync(path.join(__dirname, '../config/GeoIP-CN'), 'utf8')
        .split('\r\n')
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

exports.createServer = function (ports) {

    let proxyStr = getProxy(ports);
    let ruleStr = getRules();
    let proxyFunc = fs.readFileSync(path.join(__dirname,'../config/pac.js'), {encoding: 'utf8'});

    fs.writeFileSync('proxy.pac', `${proxyStr}\n${ruleStr}\n${proxyFunc}`);

    return http.createServer(function (req, res) {
        fs.readFile(path.join(__dirname,'../proxy.pac'), 'binary', function (err, file) {
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
    }).listen('8090', function () {
        logger.status('pacserver listening on 8090');
    });
};


