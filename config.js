/**
 * NAME 2016/9/6
 * DATE 2016/9/6
 * AUTHOR shangxinbo
 */

module.exports = {
    serverAddr: 'a.ssx.host',
    serverPort: 1024,
    localAddr: '127.0.0.1',
    localPort: 1080,
    password: '93472450',
    pacServerPort: 8090,
    timeout: 600,
    method: 'aes-256-cfb',
    level: 'warn',

    httpServer: '127.0.0.1',
    httpPort: 9527,
    dnsServer:[],         //['8.8.8.8','114.114.114.114'],

    // ipv6
    localAddrIPv6: '::1',
    serverAddrIPv6: '::1',

    // dev options
    _recordMemoryUsage: false
};