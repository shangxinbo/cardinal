const expect = require('chai').expect
const http = require('http')
const https = require('https')
const config = require('../config/local.json')
const mhttp = require('../http/index')
const magent = require('../http/agent')

describe('HTTP测试', () => {

    describe('创建HTTP代理', () => {
        it('server创建成功', done => {
            mhttp.createServer(4000)
            http.get(`http://127.0.0.1:${config.httpPort}`, res => {
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
        it('https', done => {
            https.get('https://www.baidu.com', res => {
                magent.https(30000, () => {
                    done()
                })(res, res)
            })
        })
    })
    
})