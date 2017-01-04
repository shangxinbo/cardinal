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

//更新server list
spider.update();

let tcpPorts = tcp.createServer();
//TODO 选择合适的tcp代理
let filters = [];
for (let i = 0; i < tcpPorts.length; i++) {
    let socksConfig = {
        proxyHost: '127.0.0.1',
        proxyPort: tcpPorts[i],
        auths: [socks.auth.None()]
    };
    let req = http.get({
        hostname: 'google.com',
        port: 80,
        agent: new socks.HttpAgent(socksConfig)
    }, function (res) {
        if (res.statusCode == 200 || res.statusCode == 302) {
            filters.push(tcpPorts[i]);
        }
    });
    req.on('error', function () {
        logger.error('TCP hang up unexpacted');
        req.end();
    });
    req.setTimeout(1000, function () {  //设置请求响应界限
        req.abort();
    });
}

start();
function start() {
    setTimeout(function () {
        if (filters.length > 0) {
            let httpPorts = mhttp.createServer(filters);
            let pacServer = pac.createServer(httpPorts);

            // set browser proxy auto config url
            // on windows platform chrome://settings/ ——>  更改代理服务器 ——> 连接 ——> 局域网设置 ——>使用自动配置脚本
            var cmd = 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v AutoConfigURL /t REG_SZ /d "http://' + config.host + ':' + config.pacPort + '/proxy.pac" /f';
            var child = exec(cmd, function (err, stdout, stderr) {
                if (err) throw err;
                logger.status('set PAC success');
            });
            process.on('uncaughtException', function (err) {
                //TODO recovery browser proxy auto url
                logger.error('uncaughtException' + err);
            });
        } else {
            start();
        }
    }, 1000);
}