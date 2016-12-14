const isV4Format = require('ip').isV4Format;
const lookup = require('dns').lookup;
const DEFAULT_CONFIG = require('./defaultConfig');
const ssLocal = require('./ssLocal');

// export for test
function resolveServerAddr(config, next) {
    const {serverAddr} = config;

    if (isV4Format(serverAddr)) {
        next(null, config);
    } else {
        lookup(serverAddr, (err, addresses) => {
            if (err) {
                next(new Error(`failed to resolve 'serverAddr': ${serverAddr}`), config);
            } else {
                // NOTE: mutate data
                config.serverAddr = addresses;
                next(null, config);
            }
        });
    }
}

const argv = process.argv.slice(2);
const config = Object.assign({}, DEFAULT_CONFIG);
resolveServerAddr(config, (err, config) => {
    if (err) {
        throw err;
    }
    return ssLocal.startServer(config, true);
});
