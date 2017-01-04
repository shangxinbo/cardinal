"use strict";

const exec = require('child_process').exec;
const http = require('http');
const socks = require('socksv5');
const tcp = require('../socks');
const mhttp = require('../http');
const pac = require('../pac');
const config = require('../config/local.json');
const logger = require('../utils/logger');
const spider = require('../spider');

spider.update();  //sync update list
let tcpPorts = tcp.createServer();
let best = null;
function optimal() {
    best = null;
    for (let i = 0; i < tcpPorts.length; i++) {
        let tmp = tcpPorts[i];
        let req = http.get({
            hostname: 'google.com',
            port: 80,
            agent: new socks.HttpAgent({
                proxyHost: config.host,
                proxyPort: tcpPorts[i],
                auths: [socks.auth.None()]
            })
        }, function (res) {
            if (res.statusCode == 200 || res.statusCode == 302) {
                best = tmp;
                req.end();
            }
        });
        req.on('error', function () { //tcp挂掉的错误接收 
            req.end();
        });
        req.setTimeout(1000, function () {  //设置请求响应界限
            req.abort();
        });
    }
}

function start() {
    setTimeout(function () {
        if (best) {
            let httpPorts = mhttp.createServer([best], function () {
                optimal();
                start();
            });
            let pacServer = pac.createServer(httpPorts);

            //windows set browser proxy auto config script
            var cmd = 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v AutoConfigURL /t REG_SZ /d "http://' + config.host + ':' + config.pacPort + '/proxy.pac" /f';
            var child = exec(cmd, function (err, stdout, stderr) {
                if (err) {
                    logger.error(err);
                } else {
                    logger.status('set PAC success');
                }
            });
        } else {
            start();
        }
    }, 1000);
}

optimal();
start();

process.on('uncaughtException', function (err) {
    //windows recovery browser proxy auto config script
    var cmd = 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v AutoConfigURL /t REG_SZ /d "-" /f';
    var child = exec(cmd);
    logger.error('uncaughtException' + err);
});