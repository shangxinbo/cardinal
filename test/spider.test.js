const expect = require('chai').expect
const assert = require('chai').assert
const path = require('path')
const fs = require('fs')
const spider = require('../spider')
const source = require('../spider/source')

describe('爬虫程序测试', () => {
    
    it('源是否有问题',()=>{
        expect(source).to.be.an('array')
        for(let item of source){
            expect(item).to.have.property('url')
            expect(item).to.have.property('deXml')
            let mockbody = item.deXml('<html><head></head><body></body></html>')
            expect(mockbody).to.not.be.undefined
        }
    })

    it('是否成功抓取节点数据', done => {
        spider.getServers(function (err,arr) {
            console.log(arr)
            expect(arr).to.be.have.length.above(0)
            done()
        })
    })
})