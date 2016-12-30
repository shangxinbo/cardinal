/**
 * NAME 2016/12/14
 * DATE 2016/12/14
 * AUTHOR shangxinbo
 */

global.LOCAL_CONF = require('./config/local.json');
global.SERVER_CONF = require('./config/server.json');

const isIpv4 = require('ip').isV4Format;
const local = require('./tcp/socks');
const jet = require('./http/jet');
const pac = require('./http/pac');
const logger = require('./logger');
/*const lookup = require('dns').lookup;*/


//创建socks server
local.createServer();
pac.createPACServer();
/*if (isIpv4(serverAddr)) {
    local.createServer();
} else {
    lookup(serverAddr, function(err, addresses){
        if (err) {
            logger.error(`Socks resolve 'serverAddr': ${LOCAL_CONF.socksHost} error`);
        } else {
            LOCAL_CONF.socksHost = addresses;
            local.createServer();
        }
    });
}*/

//创建http server

jet.listen(LOCAL_CONF.httpPort, LOCAL_CONF.httpHost, () => {
    logger.status(`HTTP listening on ${LOCAL_CONF.httpHost}:${LOCAL_CONF.httpPort}...`);
});

jet.on('error', (e) => {
    logger.error(e.code);
    if (e.code === 'EADDRINUSE') {
        process.exit(1)
    }
});