'use strict';

const fs = require('fs');
const path = require('path');
const dns = require('dns');
const http = require('http');
const https = require('https');
const url = require('url');
const sources = require('./source');
const logger = require('../utils/logger');

/**
 * @method store server list to a file for cache
 * @param {Array} arr
 * @param {Function} callback 
 */
function store(arr, callback) {
    let c = arr.length;
    for (let i = 0; i < arr.length; i++) {
        dns.lookup(arr[i].host, function (err, address, family) {
            c--;
            if (err) logger.error(err);
            arr[i].host = address;
            if (c == 0) {
                callback();
                fs.writeFileSync(path.join(__dirname, '../config/server.json'), JSON.stringify({ "list": arr }));
            }
        });
    }
}

exports.update = function (callback) {
    let dymicArr = [];
    if (sources instanceof Array && sources.length > 0) {
        let counter = sources.length;                    //爬虫结果计数
        for (let i = 0; i < sources.length; i++) {
            agent(sources[i].url, function (err, data) {
                if (err) {
                    logger.error(err);
                    return;
                }
                counter--;
                let arr = sources[i].deXml(data); console.log(arr);
                if (arr) {
                    dymicArr = dymicArr.concat(arr);
                }
                if (counter == 0) {
                    store(dymicArr, callback);
                }
            })
        }
    } else {
        //TODO: 将爬虫的源配置到config里
        logger.error('the source of servers is null,please check spider/source.js');
    }
}

function agent(_url, callback) {
    let protocol = url.parse(_url).protocol;
    if (protocol == 'https:') {
        let req = https.get(_url, function (res) {
            if (res.statusCode == 200) {
                res.setEncoding('utf-8');
                let data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                }).on('end', function () {
                    if (callback) callback(null, data);
                })
            }
        }).on('error', function (err) {
            if (callback) callback(err);
        });
        req.setTimeout(1500, function () {
            req.abort();
        });
    } else {
        let req = http.get(_url, function (res) {
            if (res.statusCode == 200) {
                res.setEncoding('utf-8');
                let data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                }).on('end', function () {
                    if (callback) callback(null, data);
                })
            }
        }).on('error', function (err) {
            if (callback) callback(err);
        });
        req.setTimeout(1500, function () {
            req.abort();
        });
    }
}