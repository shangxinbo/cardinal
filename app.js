/**
 * NAME 2016/12/14
 * DATE 2016/12/14
 * AUTHOR shangxinbo
 */

const isIpv4 = require('ip').isV4Format;
const lookup = require('dns').lookup;
const config = require('./config');
const local = require('./socks/local');
const jet = require('./jet/jet');

const {serverAddr,httpServer,httpPort} = config;

//创建socks server
if (isIpv4(serverAddr)) {
    local.createServer(config);
} else {
    lookup(serverAddr, function(err, addresses){
        if (err) {
            throw new Error(`failed to resolve 'serverAddr': ${serverAddr}`);
        } else {
            config.serverAddr = addresses;
            local.createServer(config);
        }
    });
}

//创建http server

jet.listen(httpPort, httpServer, () => {
    console.log(`http Listening on ${httpServer}:${httpPort}...`);
})

jet.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        process.exit(1)
    }
})