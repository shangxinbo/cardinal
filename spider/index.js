'use strict';

const fs = require('fs');
const path = require('path');
const axios = require("axios");
const sources = require('./source');
const logger = require('../utils/logger');
const dns = require('dns');

/**
 * @method store server list to a file for cache
 * @param {Array} arr
 * @param {Function} callback 
 */
function store(arr, callback) {
    let c = arr.length;
    for(let i=0;i<arr.length;i++){
        dns.lookup(arr[i].host,function(err,address,family){
            c--;
            if(err) logger.error(err);
            arr[i].host = address;
            if(c==0){
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
            axios.get(sources[i].url, { timeout: 2500 })
                .then(res => {
                    counter--;
                    let arr = sources[i].deXml(res.data);
                    console.log(res.data);
                    if (arr) {
                        dymicArr = dymicArr.concat(arr);
                    }
                    if (counter == 0) {
                        store(dymicArr, callback);
                    }
                })
                .catch(err => {
                    counter--;
                    if (counter == 0) {
                        store(dymicArr, callback);
                    }
                });
        }
    } else {
        //TODO: 将爬虫的源配置到config里
        logger.error('the source of servers is null,please check spider/source.js');
    }
}
module.exports.update();