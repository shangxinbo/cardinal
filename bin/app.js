const http = require('http');
const fs = require('fs');
const path = require('path');
const socks = require('socks');
const msocks = require('../socks');
const mhttp = require('../http');
const pac = require('../pac');
const config = require('../config/local.json');
const logger = require('../utils/logger');
const spider = require('../spider');

let socksPorts = [];
//TODO: 改成命令行形式使用npm安装
init();

function init() {
    spider.update(() => {                // 更新节点
        socksPorts = msocks.createServer();
        optimal();
    });
}

//择优选择线路
function optimal() {
    let httpRunning = false;                  // 防止多服务耗费资源
    if (socksPorts.length <= 0) {             // 没有可用的socks,重新更新节点
        init();
        return false;
    }
    for (let i = 0; i < socksPorts.length; i++) {
        let tmp = socksPorts[i];
        let req = http.get({
            hostname: 'google.com',
            port: 80,
            agent: new socks.Agent({
                proxy: {
                    ipaddress: config.host,
                    port: socksPorts[i],
                    type: 5
                }
            }, false, false)
        }, (res) => {
            if (res.statusCode == 200 || res.statusCode == 302) {
                if (!httpRunning) {
                    start(tmp);
                    //pac.updateIPs(tmp);
                    httpRunning = true;
                }
            }
            req.end();
        }).on('error', () => req.end() );
        req.setTimeout(1000, ()=> req.abort());    //TODO: 设置请求响应时限
    }
}

function start(socks) {
    let pacServer = pac.createServer();
    let httpPorts = mhttp.createServer(socks, () => {
        pacServer.close(() => optimal());         // 重新选择可用资源
    });
    pac.addPacUrl();
}

process.on('uncaughtException', (err) => {
    pac.removePacUrl();
    logger.error('uncaughtException' + err);
});
//程序正常退出时，恢复系统代理配置
process.on('SIGINT', () => {
    pac.removePacUrl(() => { process.exit() });
});