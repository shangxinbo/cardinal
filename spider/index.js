'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require("cheerio");
const request = require('sync-request');
const sources = require('./source');
const logger = require('../utils/logger');

/**
 * 抓取信息
 * @param url
 * @return buffer response body
 */
function grab(url) {
    //TODO: 链接请求不到throw error
    var res = request('GET', url); 
    if (res.statusCode == 200) {
        return res.getBody();
    } else {
        logger.error(res.statusCode);
        return null;
    }
}

//TODO: async this
exports.update = function() {
    let dymicArr = [];
    if (sources.length > 0) {
        for (let i = 0; i < sources.length; i++) {
            let data = grab(sources[i].url);
            if (data) {
                let arr = sources[i].deXml(data);
                if (arr) {
                    dymicArr = dymicArr.concat(arr);
                }
            }
        }
    } else {
        logger.error('source is null');
    }
    fs.writeFileSync(path.join(__dirname,'../config/server.json'), JSON.stringify({"list":dymicArr}));
}