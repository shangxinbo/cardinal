const expect = require('chai').expect
const assert = require('chai').assert
const spider = require('../spider')
const path = require('path')
const fs = require('fs')

describe('爬虫程序测试', function () {
    it('是否成功抓取节点数据', function (done) {
        spider.update(function () {
            console.log(234)
            let servers = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/server.json')).toString())
            assert.isObject(servers)
            expect(servers.list).to.be.have.length.above(0)
            done()
        })
    })
})