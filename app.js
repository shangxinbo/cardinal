/**
 * NAME 2016/12/14
 * DATE 2016/12/14
 * AUTHOR shangxinbo
 */

const isIpv4 = require('ip').isV4Format;
const lookup = require('dns').lookup;
const config = require('./config');
const local = require('./tcp/socks');
const jet = require('./http/jet');
const logger = require('./logger');

const {serverAddr,httpServer,httpPort} = config;

//创建socks server
if (isIpv4(serverAddr)) {
    local.createServer(config);
} else {
    lookup(serverAddr, function(err, addresses){
        if (err) {
            logger.error(`Socks resolve 'serverAddr': ${serverAddr} error`);
        } else {
            config.serverAddr = addresses;
            local.createServer(config);
        }
    });
}

//创建http server

jet.listen(httpPort, httpServer, () => {
    logger.status(`HTTP listening on ${httpServer}:${httpPort}...`);
});

jet.on('error', (e) => {
    logger.error(e.code);
    if (e.code === 'EADDRINUSE') {
        process.exit(1)
    }
});