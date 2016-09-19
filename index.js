
"use strict";

const request = require('request');
const cheerio = require("cheerio");
const fs = require('fs');
const cdr = require("child_process");
const configs = require('./config.js');
const winston = require('winston');
const MESSAGE = require('./i18n/cn');


winston.add(winston.transports.File, { filename: 'work.log' });
winston.remove(winston.transports.Console);


let guiConf = 'gui-config.json';
let runingProcess = '';

update(true);

setInterval(function(){ update(); },10*60*1000);

function update(init){
    request({
        uri: 'http://www.ishadowsocks.org/',
        method: 'GET'
    },function(error, response, body){
        if(error){
            winston.error(MESSAGE.REQUEST_ERROR);
            return false;
        }
        let $ = cheerio.load(body);
        let list = $('#free .col-lg-4');
        let o_config = JSON.parse(fs.readFileSync(guiConf));

        if(!init){
            if(o_config.configs[0].password == $(list[0]).find('h4').eq('2').html().split(':')[1]) {
                winston.info(MESSAGE.KEEP_CONFIG);
                return false;
            }
        }else{
            winston.info(MESSAGE.START_SS);
        }

        for(let i=0;i<list.length;i++){
            let name = $(list[i]).find('h4').eq('0').html().split(':')[1];
            let port = $(list[i]).find('h4').eq('1').html().split(':')[1];
            let passw = $(list[i]).find('h4').eq('2').html().split(':')[1];
            let method = $(list[i]).find('h4').eq('3').html().split(':')[1];
            configs.configs.push({
                "server": name,
                "server_port": port,
                "password": passw,
                "method": method,
                "remarks": "",
                "auth": false
            });
        }
        save(configs);
    });
}

function save(configs){
    fs.writeFile(guiConf, JSON.stringify(configs), function (err) {
        if(err){
            winston.error(MESSAGE.SAVE_CONFIG_ERROR);
        }
        if(runingProcess){
            runingProcess.kill();
            winston.error(MESSAGE.STOP_SS);
        }
        runingProcess = cdr.execFile('./Shadowsocks.exe');
    });
}

