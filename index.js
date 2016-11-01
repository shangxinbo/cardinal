
"use strict";

const request = require('request');
const fs = require('fs');
const cdr = require("child_process");
const winston = require('winston');                         //日志插件

const exePath = require('./package.json').config.exe_path;  //windows-shadowsocks.exe 路径配置
const config = require('./config.js');                      //项目配置文件
const MESSAGE = require(config.app.language);               //日志文字映射
const SSCONGIF_PATH = exePath + 'gui-config.json';          //shadowsocks 配置文件路径
const crawler = require('./crawler');
//日志文件配置
winston.add(winston.transports.File, {filename: config.app.log_file});
winston.remove(winston.transports.Console);

let runingProcess = '';

update(true);
setInterval(function () {
    update();
}, 60 * 1000 * config.app.interval);

function update(init) {
    let iss = new crawler.iss();
    let fvss = new crawler.fvss();
    let tss = new crawler.tss();
    let frss = new crawler.frss();
    config.shadowsocks.configs = [];
    grab(iss.url).then(function(body){
        body.on('response',function(response){
            console.log(response.body);
        });
    });
    save(config.shadowsocks);
}

/**
 * 抓取信息
 * @param options.url
 * @param options.success
 * @param options.error
 * @return null
 */
function grab(url,success,error){

    request({
        uri: config.ishadowsocks_url,
        method: 'GET'
    },function(err,response,body){
        if (err) {
            error(err);
        }else{
            success(body);
        }
    })
}

function save(configs) {
    fs.writeFile(SSCONGIF_PATH, JSON.stringify(configs), function (err) {
        if (err) {
            winston.error(MESSAGE.SAVE_CONFIG_ERROR);
        }
        if (runingProcess) {
            runingProcess.kill();
            winston.error(MESSAGE.STOP_PROCESS);
        }
        cdr.exec('taskkill /f /FI "IMAGENAME eq shadowsocks.exe', function (error, stdout, stderr) {
            if (error) {
                winston.error(MESSAGE.STOP_SS_ERROR);
            }
            runingProcess = cdr.execFile(exePath + 'Shadowsocks.exe', [], {}, function () {
                winston.info(MESSAGE.START_PROCESS);
            });
        });
    });
}

