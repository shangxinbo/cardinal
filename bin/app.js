"use strict";

const socks = require('../socks');
const mhttp = require('../http');
const pac = require('../pac');
const config = require('../config/local.json');
const exec = require('child_process').exec;
const logger = require('../utils/logger');
const spider = require('../spider'); 
const Socks = require('socks');

//更新server list
spider.update();

let socksPorts = socks.createServer();
//TODO 选择合适的tcp代理
for(var i=0;i<socksPorts.length;i++){
    var options = {
        proxy: {
            ipaddress: "127.0.0.1", // Random public proxy
            port: socksPorts[i],
            type: 5
        },
        target: {
            host: "google.com", // can be an ip address or domain (4a and 5 only)
            port: 80
        }
    };
    Socks.createConnection(options, function(err, socket, info) {
        if (err){
            console.log(err);
        }else {
            // Connection has been established, we can start sending data now:
            socket.write("GET / HTTP/1.1\nHost: google.com\n\n");
            socket.on('data', function(data) {
                console.log(data.length);
                console.log(data);
            });

            // PLEASE NOTE: sockets need to be resumed before any data will come in or out as they are paused right before this callback is fired.
            socket.resume();
        }
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