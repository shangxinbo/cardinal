
const request = require('request');
var cheerio = require("cheerio");
const fs = require('fs');
update();
setInterval(function(){
    update();
},10*60*1000);

function update(){
    request({
        uri: 'http://www.ishadowsocks.org/',
        method: 'GET'
    },function(error, response, body){
        var $ = cheerio.load(body);
        var list = $('#free .col-lg-4');
        var configs = {
            "configs": [],
            "strategy": null,
            "index": 0,
            "global": false,
            "enabled": true,
            "shareOverLan": true,
            "isDefault": false,
            "localPort": 1080,
            "pacUrl": null,
            "useOnlinePac": false,
            "availabilityStatistics": false,
            "autoCheckUpdate": true,
            "isVerboseLogging": false,
            "logViewer": null,
            "useProxy": false,
            "proxyServer": null,
            "proxyPort": 0
        };
        for(var i=0;i<list.length;i++){
            var name = $(list[i]).find('h4').eq('0').html().split(':')[1];
            var port = $(list[i]).find('h4').eq('1').html().split(':')[1];
            var passw = $(list[i]).find('h4').eq('2').html().split(':')[1];
            var method = $(list[i]).find('h4').eq('3').html().split(':')[1];
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
                return console.log(err);
            }
            console.log('request success');
        });
    });
}
