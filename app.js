/**
 * NAME 2016/12/14
 * DATE 2016/12/14
 * AUTHOR shangxinbo
 */

global.LOCAL_CONF = require('./config/local.json');
const local = require('./tcp/socks');
const logger = require('./logger');
const http = require('http');
const ipChecker = require('./http/geoIPCheck');
const agent = require('./http/agent');
const fs = require('fs');
const path = require('path');
const geoipFile = path.join(__dirname, './config/GeoIP-CN');

//创建socks server
let socksPorts = local.createServer();
let httpPorts = [];

//创建http server
for(let i=0;i<socksPorts.length;i++){
    let proxy = http.createServer();
    let port = socksPorts[i]+100;
    proxy.on('request', (req, res) => {
        ipChecker(req, (tunnel) => {
            agent.http(tunnel,socksPorts[i])(req, res);
        });
    });
    proxy.on('connect', (req, socket, head) => {
        ipChecker(req, (tunnel) => {
            agent.https(tunnel,socksPorts[i])(req, socket, head);
        });
    });
    proxy.listen(port, '127.0.0.1', () => {
        logger.status(`HTTP listening on 127.0.0.1:${port}...`);
    });
    proxy.on('error', (e) => {
        logger.error(e.code);
        /*if (e.code === 'EADDRINUSE') {
            process.exit(1)
        }*/
    });
    httpPorts.push(port);
}


/**
 * read china ips
 * */
function readGeoIPList() {
    return fs.readFileSync(geoipFile, 'utf8').split('\r\n').filter(function (rx) {  // filter blank cidr
        return rx.length
    })
}
var CHINA_NETS = readGeoIPList();
var ipsArr = [];
var proxyStr = 'var proxy = "';
for(var h=0;h<httpPorts.length;h++){
    proxyStr += 'PROXY 127.0.0.1:'+ httpPorts[h] + ';';
}
proxyStr += 'DIRECT;";';

for(var i=0;i<CHINA_NETS.length;i++){
    var thisIp = CHINA_NETS[i];
    var tmp = thisIp.split('/');
    ipsArr.push(JSON.stringify({
        ip:tmp[0],
        mask:subNetMask(tmp[1])
    }));
}
function subNetMask(num){
    var str = '';
    for(var i=0;i<32;i++){
        if(i<num){
            str += '1';
        }else{
            str += '0';
        }
    }
    var arr = [
        str.substr(0,8),
        str.substr(8,8),
        str.substr(16,8),
        str.substr(24,8)
    ];
    for(var j = 0;j<4;j++){
        arr[j] = parseInt(arr[j],2);
    }
    return arr.join('.');
}

var rulesStr = 'var ipsArr=[' + ipsArr.join(',') + '];';
var proxyFun = fs.readFileSync('./config/pac.js',{encoding:'utf8'});
fs.writeFileSync('proxy.pac',`${proxyStr}\n${rulesStr}\n${proxyFun}`);


var pacServer = http.createServer(function(req,res){
    fs.readFile('proxy.pac','binary',function(err,file){
        if (err) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end(err);
        } else {
            var contentType = "application/x-ns-proxy-autoconfig";
            res.writeHead(200, {
                'Content-Type': contentType
            });
            res.write(file, "binary");
            res.end();
        }
    });
});
pacServer.listen('8090');
logger.status('pacserver listening on 8090');

