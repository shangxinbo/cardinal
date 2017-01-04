"use strict";

const exec = require('child_process').exec;
const Socks = require('socksv5');
const http = require('http');
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
for (var i = 0; i < tcpPorts.length; i++) {
    var socksConfig = {
        proxyHost: '127.0.0.1',
        proxyPort: tcpPorts[i],
        auths: [Socks.auth.None()]
    };

    var req = http.get({
        hostname: 'google.com',
        port: 80,
        agent: new Socks.HttpAgent(socksConfig)
    }, function (res) {
        console.log(res.statusCode, res.headers);
    });
    req.setTimeout(1000,function(){
        req.abort();
    });
}



// let httpPorts = mhttp.createServer(socksPorts);
// let pacServer = pac.createServer(httpPorts);

// // set browser proxy auto config url
// // on windows platform chrome://settings/ ——>  更改代理服务器 ——> 连接 ——> 局域网设置 ——>使用自动配置脚本
// var cmd = 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v AutoConfigURL /t REG_SZ /d "http://' + config.host + ':' + config.pacPort + '/proxy.pac" /f';
// var child = exec(cmd, function (err, stdout, stderr) {
//     if (err) throw err;
//     logger.status('set PAC success');
// });
// process.on('uncaughtException', function (err) {
//     logger.error('uncaughtException' +err);
// });