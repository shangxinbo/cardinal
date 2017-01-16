const expect = require('chai').expect
const assert = require('chai').assert
const path = require('path')
const fs = require('fs')
const spider = require('../spider')
const source = require('../spider/source')

describe('爬虫程序测试', () => {
    
    it('源是否有问题',()=>{
        expect(source).to.be.an('object')
        for(var item in source){
            expect(item).to.have.property('url')
            expect(item).to.have.property('deXml')
        }
    })

    it('是否成功抓取节点数据', done => {
        spider.update(function () {
            let servers = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/server.json')).toString())
            assert.isObject(servers)
            expect(servers.list).to.be.have.length.above(0)
            done()
        })
    })
})