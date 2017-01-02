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


//创建socks server
let socksPorts = local.createServer();


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
}

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

