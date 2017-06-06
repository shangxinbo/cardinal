const expect = require('chai').expect
const assert = require('chai').assert
const path = require('path')
const fs = require('fs')

// describe('测试server list 是否正常', () => {
//     it('server config 结构是否正确', () => {
//         let servers = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/server.json')).toString())
//         expect(servers).to.have.property('list')
//         for(var item of servers.list){
//             expect(item).to.have.property('host')
//             expect(item).to.have.property('port')
//             expect(item).to.have.property('password')
//             expect(item).to.have.property('method')
//         }
//     })
// })