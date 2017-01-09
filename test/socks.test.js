var expect = require('chai').expect;
var socks = require('../socks/index');

describe('TCP SOCKS 建立测试', function () {
    it('建立socks server是否成功', function () {
        var ports = socks.createServer();
        expect(ports).to.be.an.instanceOf(Array);
        expect(ports).to.be.have.length.above(0);
    });
})