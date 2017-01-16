const expect = require('chai').expect
const http = require('http')
const socks = require('socks')
const config = require('../config/local.json')
const mhttp = require('../http/index')
const magent = require('../http/agent')

describe('socks 模块测试', () => {

    describe('加密算法列表', () => {
        it('列表是否正确输出', () => {
            expect(cipher).to.be.an('object')
            for (let item in cipher) {
                expect(item).to.be.instanceOf(Array)
                expect(item).to.be.length.within(2, 2)
                expect(item[0], item[1]).to.be.instanceOf(Number);
            }
        })
    })

    describe('加密函数库是否正确', () => {
        let atype = Object.keys(cipher)[Math.ceil(Math.random() * cipher.length)]
        let getcipher = encrypt.createCipher('1234', type, 'data')
        it('加密', () => {
            expect(getcipher).to.have.property('cipher')
            expect(getcipher).to.have.property('data')
        })
        it('解密', () => {
            let getDecipher = encrypt.createDecipher('1234', type, getcipher.data)
            expect(getDecipher).to.have.property('decipher')
            expect(getDecipher).to.have.property('data')
        })
    })

    describe('建立socks server是否成功', () => {
        it('建立socks server是否成功', function () {
            var ports = msocks.createServer()
            expect(ports).to.be.an.instanceOf(Array)
            expect(ports).to.be.have.length.above(0)
            /*let tmp = ports[0]
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
                    req.end()
                    done()
                }
            })*/
        })
    })

})