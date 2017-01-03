"use strict";

const socks = require('../socks');
const mhttp = require('../http');
const pac = require('../pac');
const config = require('../config/local.json');
const exec = require('child_process').exec;
const logger = require('../utils/logger');
const spider = require('../spider'); 

//更新server list
spider.update();

let socksPorts = socks.createServer();
let httpPorts = mhttp.createServer(socksPorts);
let pacServer = pac.createServer(httpPorts);

// set browser proxy auto config url
// on windows platform chrome://settings/ ——>  更改代理服务器 ——> 连接 ——> 局域网设置 ——>使用自动配置脚本
var cmd = 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v AutoConfigURL /t REG_SZ /d "http://' + config.host + ':' + config.pacPort + '/proxy.pac" /f';
var child = exec(cmd, function (err, stdout, stderr) {
    if (err) throw err;
    logger.status('set PAC success');
});
