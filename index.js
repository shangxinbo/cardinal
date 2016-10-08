"use strict";

const request = require('request');
const cheerio = require("cheerio");
const fs = require('fs');
const cdr = require("child_process");
const winston = require('winston');
const config = require('./package.json').config;

const SHADOWSOCS_BASE_CONFIG = require('./baseConfig.js');
const MESSAGE = require(config.language);

winston.add(winston.transports.File, {filename: config.log_file});
winston.remove(winston.transports.Console);


let guiConf = config.shadowsocks_path + 'gui-config.json';
let runingProcess = '';

update(true);
setInterval(function () {
    update();
}, 60 * 1000 * config.interval);

function update(init) {
    request({
        uri: config.ishadowsocks_url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            winston.error(MESSAGE.REQUEST_ERROR);
            return false;
        }
        let $ = cheerio.load(body);
        let list = $('#free .col-sm-4');
        let o_config = JSON.parse(fs.readFileSync(guiConf));
        if (!init) {
            if (o_config.configs[0].password == $(list[0]).find('h4').eq('2').html().split(':')[1]) {
                winston.info(MESSAGE.KEEP_CONFIG);
                return false;
            }
        } else {
            winston.info(MESSAGE.START_SS);
        }
        SHADOWSOCS_BASE_CONFIG.configs = [];
        for (let i = 0; i < list.length; i++) {
            let name = $(list[i]).find('h4').eq('0').html().split(':')[1];
            let port = $(list[i]).find('h4').eq('1').html().split(':')[1];
            let passw = $(list[i]).find('h4').eq('2').html().split(':')[1];
            let method = $(list[i]).find('h4').eq('3').html().split(':')[1];
            SHADOWSOCS_BASE_CONFIG.configs.push({
                "server": name,
                "server_port": port,
                "password": passw,
                "method": method,
                "remarks": "",
                "auth": false
            });
        }
        save(SHADOWSOCS_BASE_CONFIG);
    });
}

function save(configs) {
    fs.writeFile(guiConf, JSON.stringify(configs), function (err) {
        if (err) {
            winston.error(MESSAGE.SAVE_CONFIG_ERROR);
        }
        if (runingProcess) {
            runingProcess.kill();
            winston.error(MESSAGE.STOP_PROCESS);
        }
        cdr.exec('taskkill /f /FI "IMAGENAME eq shadowsocks.exe',function(error,stdout,stderr){
            if(error){
                winston.error(MESSAGE.STOP_SS_ERROR);
            }
            runingProcess = cdr.execFile(config.shadowsocks_path + 'Shadowsocks.exe',[],{},function(){
                winston.info(MESSAGE.START_PROCESS);
            });
        });
    });
}

