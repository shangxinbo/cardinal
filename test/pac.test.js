const expect = require('chai').expect
const http = require('http')
const config = require('../config/local.json')
const pac = require('../pac')

describe('pac 模块测试', () => {
    it('create server', (done) => {
        pac.createServer()
        http.request({
            host: config.pacPort,
            port: config.pacPort
        }, () => {
            done()
        })
    })
    it('update ips in china', done => {
        pac.updateIPs(30000, () => {
            done()
        })
    })
    it('add pac url', () => {
        pac.addPacUrl()
    })
    it('remove pac url', () => {
        pac.removePacUrl()
    })
})