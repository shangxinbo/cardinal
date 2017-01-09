const expect = require('chai').expect;
const tcp = require('../socks/index');
const http = require('http');
const socks = require('socksv5');
const config =require('../config/local.json');

describe('TCP SOCKS 建立测试', function () {
    it('建立socks server是否成功', function () {
        var ports = tcp.createServer();
        for (let i = 0; i < ports.length; i++) {
            let tmp = ports[i];
            let req = http.get({
                hostname: 'google.com',
                port: 80,
                agent: new socks.HttpAgent({
                    proxyHost: config.host,
                    proxyPort: ports[i],
                    auths: [socks.auth.None()]
                })
            }, function (res) {
                if (res.statusCode == 200 || res.statusCode == 302) {
                    expect(ports).to.be.an.instanceOf(Array);
                    expect(ports).to.be.have.length.above(0);
                    req.end();
                }
            });
        }
    });
})