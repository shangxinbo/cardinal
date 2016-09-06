
"use strict";

const request = require('request');
const cheerio = require("cheerio");
const fs = require('fs');
const cdr = require("child_process");
const configs = require('./config.js');

let runingProcess = '';

console.log('init at ' + Date());

update(1);
setInterval(function(){
    update();
},10*60*1000);

function update(init){
    request({
        uri: 'http://www.ishadowsocks.org/',
        method: 'GET'
    },function(error, response, body){

        if(error){
            return console.log('request error:' + error.errno);
        }else{
            console.log('request success');
        }

        let $ = cheerio.load(body);
        let list = $('#free .col-lg-4');
        let o_config = JSON.parse(fs.readFileSync('gui-config.json'));

        if(!init){
            if(o_config.configs[0].password == $(list[0]).find('h4').eq('2').html().split(':')[1]) {
                return console.log('merge');
            }else{
                console.log('update config at:' + Date());
            }
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
        fs.writeFile('gui-config.json', JSON.stringify(configs), function (err) {
            if (err) {
                return console.log('write file error' + err.error);
            }
            if(runingProcess){
                runingProcess.kill();
                console.log('stop success');
            }
            runingProcess = cdr.execFile('./Shadowsocks.exe',function(){
                console.log('start success');
            });
        });
    });
}
