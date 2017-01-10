"use strict";

const http = require('http');
const socks = require('socks');
const tcp = require('../socks');
const mhttp = require('../http');
const pac = require('../pac');
const config = require('../config/local.json');
const logger = require('../utils/logger');
const spider = require('../spider');
const fs = require('fs');
const path = require('path');

let socksPorts = [];
let bestSocks = null;
//TODO 改成命令行形式使用npm安装
init();

function init() {
    spider.update(function () {                // 更新节点
        socksPorts = tcp.createServer();
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
        }, function (res) {
            if (res.statusCode == 200 || res.statusCode == 302) {
                if (!httpRunning) {
                    start(tmp);
                    httpRunning = true;
                }
            }
            req.end();
        }).on('error', function () {
            req.end();
        });
        req.setTimeout(1000, function () {    // 设置请求响应时限
            req.abort();
        });
    }
}

function start(socks) {
    let pacServer = pac.createServer();
    let httpPorts = mhttp.createServer(socks, function () {
        pacServer.close(function () {
            optimal();                        // 重新选择可用资源
        });
    });
    pac.addPacUrl();
}

function getIpsOnline(port) {
    let req = http.get({
        hostname: 'www.ipdeny.com',
        port: 80,
        path: '/ipblocks/data/aggregated/cn-aggregated.zone',
        agent: new socks.Agent({
            proxy: {
                ipaddress: config.host,
                port: socksPorts[i],
                type: 5
            }
        }, false, false)
    }, function (res) {
        if (res.statusCode == 200 || res.statusCode == 302) {
            res.setEncoding('utf-8');
            let allIps = '';
            res.on('data', function (chunk) {
                allIps += chunk;
            }).on('end', function () {
                fs.writeFile(path.join(__dirname, '../config/GeoIP-CN'), allIps);
            })
        }
    }).on('error', function (err) {
        logger.error('update IPs error');
        req.end();
    });
    req.setTimeout(5000, function () {  //设置请求响应界限
        req.abort();
    });
}

/*process.on('uncaughtException', function (err) {
    pac.removePacUrl();
    logger.error('uncaughtException' + err);
});*/
//程序正常退出时，恢复系统代理配置
process.on('SIGINT', function () {
    pac.removePacUrl(() => { process.exit() });
});