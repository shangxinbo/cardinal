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

let tcpPorts = [];
//TODO 改成命令行形式使用npm安装
init();

function init() {
    spider.update(function () {   // 更新shadowsocks服务器地址
        tcpPorts = tcp.createServer();
        optimal();
    });
}

/**
 * 择优选择线路
 */
function optimal() {
    let httpRunning = false;  // 防止多服务耗费资源
    if (tcpPorts.length > 0) {
        for (let i = 0; i < tcpPorts.length; i++) {
            let tmp = tcpPorts[i];
            let req = http.get({    //TODO: 封装形式
                hostname: 'google.com',
                port: 80,
                agent: new socks.HttpAgent({
                    proxyHost: config.host,
                    proxyPort: tcpPorts[i],
                    auths: [socks.auth.None()]
                })
            }, function (res) {
                if (res.statusCode == 200 || res.statusCode == 302) {
                    if (!httpRunning) {
                        start(tmp);
                        httpRunning = true;
                    }
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
    } else {
        init();   //没有可用的socks proxy 重新执行程序更新shadowsocks server list
    }
}

function start(socks) {
    let pacServer = pac.createServer();
    let httpPorts = mhttp.createServer(socks, function () {
        pacServer.close(function () {
            optimal();  //重新选择可用资源
        });
    });

    //windows set browser proxy auto config script
    let pacUrl = new Buffer('http://' + config.host + ':' + config.pacPort + '/proxy.pac');
    let pacHex = pacUrl.toString('hex');

    let cmd = 'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Connections" /v DefaultConnectionSettings /t REG_BINARY /d 46000000d2eb00000500000000000000000000001f000000'
        + pacHex
        + '0100000000000000000000000000000000000000000000000000000000000000 /f';
    exec(cmd, function (err, stdout, stderr) {
        if (err) {
            logger.error(err);
        } else {
            logger.status('PAC url set success in OS by reg command');
        }
    });
}

/*process.on('uncaughtException', function (err) {
    //windows recovery browser proxy auto config script
    var cmd = 'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Connections" /v DefaultConnectionSettings /t REG_BINARY /d 46000000d1eb0000010000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000 /f';
    exec(cmd);
    logger.error('uncaughtException' + err);
});*/

//程序正常退出时，恢复系统代理配置
process.on('SIGINT', function () {
    var cmd = 'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Connections" /v DefaultConnectionSettings /t REG_BINARY /d 46000000d1eb0000010000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000 /f';
    exec(cmd, function () {
        process.exit();
    });
});