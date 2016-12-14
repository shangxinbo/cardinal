// proxy options
module.exports = {
  serverAddr: 'a.ssx.host',
  serverPort: 1024,
  localAddr: '127.0.0.1',
  localPort: 1090,
  password: '19584847',
  pacServerPort: 8090,
  timeout: 600,
  method: 'aes-256-cfb',
  level: 'warn',

  // ipv6
  localAddrIPv6: '::1',
  serverAddrIPv6: '::1',

  // dev options
  _recordMemoryUsage: false,
};
