const expect = require('chai').expect
const http = require('http')
const config = require('../config/local.json')
const pac = require('../pac')

describe('pac 模块测试', () => {
    it('create server', done => {
        pac.createServer()
        var req = http.request({
            host: config.host,
            port: config.pacPort
        }, () => {
            done()
        })
        req.end()
    })
    it('add pac url', () => {
        pac.addPacUrl()
    })
    it('remove pac url', () => {
        pac.removePacUrl()
    })
})