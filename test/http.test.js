const expect = require('chai').expect
const mhttp = require('../http/index')
const magent = require('../http/agent')

describe('http 模块测试', () => {

    describe('http server', () => {
        it('create success', () => {
            mhttp.createServer(30000, () => {
                done()
            })
        })
    })

    describe('http agent', () => {
        it('http', done => {
            magent.http(20000, () => {
                done()
            })
        })
        it('https', done => {
            magent.https(20001, () => {
                done()
            })
        })
    })
})