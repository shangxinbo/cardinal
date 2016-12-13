/**
 * NAME 2016/12/9
 * DATE 2016/12/9
 * AUTHOR shangxinbo
 */

const net = require('net');
const encryptor = require('./encryptor');
const config = require('../config.json');

var client = new net.Socket();
client.connect({
    port: '1024',
    host: 'a.ssx.host'
}, function() {
    console.log('CONNECTED TO: ');
    const buf = Buffer.from('050000', 'utf8');
    client.write(buf);
});

// 为客户端添加“data”事件处理函数
// data是服务器发回的数据
client.on('data', function(data) {
    console.log(123);
    console.log('DATA: ' + data);
    // 完全关闭连接
    client.destroy();
});
client.on('drain', function(data) {
    console.log(234);
});

// 为客户端添加“close”事件处理函数
client.on('close', function() {
    console.log('Connection closed');
});
