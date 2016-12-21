
const isIpv4 = require('ip').isV4Format;
const lookup = require('dns').lookup;
const config = require('./config');
const local = require('./local');

const {serverAddr} = config;
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
