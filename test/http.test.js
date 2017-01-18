const expect = require('chai').expect
const http = require('http')
const https = require('https')
const mhttp = require('../http/index')
const magent = require('../http/agent')

describe('HTTP测试', () => {

    describe('http server', () => {
        it('create success', () => {
            mhttp.createServer(30000, () => {
                done()
            })
        })
    })

    describe('Agent模块', () => {
        it('http', done => {
            http.get('http://www.baidu.com', res => {
                magent.http(30000, () => {
                    done()
                })(res, res)
            })
        })
        it('https', () => {
            https.get('https://www.baidu.com', res => {
                magent.https(30000, () => {
                    done()
                })(res, res)
            })
        })
    })
})