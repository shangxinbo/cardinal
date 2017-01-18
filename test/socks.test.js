const expect = require('chai').expect
const http = require('http')
const socks = require('socks')
const config = require('../config/local.json')
const msocks = require('../socks/index')
const cipher = require('../socks/ciphers')
const encrypt = require('../socks/encrypt')

describe('socks 模块测试', () => {

    describe('加密算法列表', () => {
        it('列表是否正确输出', () => {
            expect(cipher).to.be.an('object')
            for (let item in cipher) {
                expect(cipher[item]).to.be.an('array')
                expect(cipher[item]).to.be.length.within(2, 2)
                expect(cipher[item][0]).to.be.an('number');
            }
        })
    })

    describe('加密函数库是否正确', () => {
        let type = Object.keys(cipher)
        type = type[Math.ceil(Math.random() * type.length)]
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
        it('建立socks server是否成功', done=> {
            var ports = msocks.createServer()
            expect(ports).to.be.an.instanceOf(Array)
            expect(ports).to.be.have.length.above(0)
            let tmp = ports[0]
            let req = http.get({
                hostname: 'google.com',
                port: 80,
                agent: new socks.Agent({
                    proxy: {
                        ipaddress: config.host,
                        port: config.proxyPortCeil,
                        type: 5
                    }
                }, false, false)
            }, function (res) {
                if (res.statusCode == 200 || res.statusCode == 302) {
                    req.end()
                    done()
                }
            })
        })
    })

})