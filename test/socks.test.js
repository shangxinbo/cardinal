const expect = require('chai').expect;
const msocks = require('../socks/index');
const http = require('http');
const socks = require('socks');
const config =require('../config/local.json');

describe('SOCKS 测试', function () {
    it('建立socks server是否成功', function (done) {
        var ports = msocks.createServer();
        expect(ports).to.be.an.instanceOf(Array);
        expect(ports).to.be.have.length.above(0);
        let tmp = ports[0];
        let req = http.get({
            hostname: 'google.com',
            port: 80,
            agent: new socks.Agent({
                proxy: {
                    ipaddress: config.host,
                    port: socksPorts[i],
                    type: 5
                } 
            }, false, false)
        }, function (res) {
            if (res.statusCode == 200 || res.statusCode == 302) {
                req.end();
                done();
            }
        });
    });
})