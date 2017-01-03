"use strict";

const http = require('http');
const agent = require('./agent');
const logger = require('../utils/logger');

const host = require('../config/local.json').host;

/**
 * @desc create http servers
 * @param socks Array socks port list
 * */
exports.createServer = function (socks) {
    let vector = 100;     // 相较于socks 代理端口的偏移向量
    let servers = [];
    if (socks instanceof Array && socks.length > 0) {
        for (let i = 0; i < socks.length; i++) {
            let proxy = http.createServer();
            let port = socks[i] + vector;
            proxy.on('request', (req, res) => {
                agent.http(socks[i])(req, res);
            }).on('connect', (req, socket, head) => {
                agent.https(socks[i])(req, socket, head);
            }).on('error', (e) => {
                logger.error(e.code);
                proxy.close();
            }).on('timeout', () => {
                console.log('http timeout');
                proxy.close();
            }).on('clientError',(err,socks)=>{
                console.log('clientError' + err);
            });
            proxy.listen(port, host, () => {
                logger.status(`HTTP listening on ${host}:${port}...`);
            });
            servers.push(port);
        }
    }
    return servers;
};
