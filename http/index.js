"use strict";

const http = require('http');
const agent = require('./agent');
const logger = require('../utils/logger');
const config = require('../config/local.json');

/**
 * @param {number} socks tcp port 
 * @param {function} callback HTTP SERVER 异常挂掉时回调函数
*/
exports.createServer = function (socks, callback) {
    if (socks) {
        let proxy = http.createServer();
        proxy.on('request', (req, res) => {
            agent.http(socks)(req, res);
        }).on('connect', (req, socket, head) => {
            agent.https(socks)(req, socket, head);
        }).on('error', (e) => {
            logger.error('http server error' + e);
            proxy.close(function(){
                if (callback) callback();
            });
        }).on('clientError', (err, socks) => {  // client browser throw error 
            console.log('clientError' + err);
            console.log(socks)
        });
        proxy.listen(config.httpPort, config.host, () => {
            logger.status(`HTTP listening on ${config.host}:${config.httpPort}...`);
        });
        return proxy;
    }else{
        logger.error('socks proxy is null');
    } 
};