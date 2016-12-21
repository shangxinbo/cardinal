// proxy options
module.exports = {
  serverAddr: 'us.ssip.club',
  serverPort: 443,
  localAddr: '127.0.0.1',
  localPort: 1081,
  password: '70519453',
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
