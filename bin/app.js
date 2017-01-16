const http = require('http')
const fs = require('fs')
const path = require('path')
const socks = require('socks')
const msocks = require('../socks')
const mhttp = require('../http')
const pac = require('../pac')
const config = require('../config/local.json')
const logger = require('../utils/logger')
const spider = require('../spider')
const argv = process.argv

let socksPorts = []
let spiderOpen = true
let updateIPs = false

if (argv.indexOf('upip') > -1) {
    updateIPs = true
}
if (argv.indexOf('sc') > -1) {
    spiderOpen = false
}
init()

function init(set) {
    if (spiderOpen) {
        spider.update(() => {                // 更新节点
            socksPorts = msocks.createServer() 
            optimal()
        })
    } else {
        socksPorts = msocks.createServer()
        optimal()
    }
}

//择优选择线路
function optimal() {
    let httpRunning = false                  // 防止多服务耗费资源
    if (socksPorts.length <= 0) {             // 没有可用的socks,重新更新节点
        init()
        return false
    }
    for (let i = 0; i < socksPorts.length; i++) {
        let tmp = socksPorts[i]
        let req = http.get({
            hostname: 'google.com',
            port: 80,
            agent: new socks.Agent({
                proxy: {
                    ipaddress: config.host,
                    port: socksPorts[i],
                    type: 5
                }
            }, false, false)
        }, (res) => {
            if (res.statusCode == 200 || res.statusCode == 302) {
                if (!httpRunning) {
                    start(tmp)
                    if (updateIPs) {
                        pac.updateIPs(tmp)
                    }
                    httpRunning = true
                }
            }
            req.end()
        }).on('error', () => req.end())
        req.setTimeout(parseInt(config.allowDelay), () => req.abort())  //msecs argument must be a number
    }
}

function start(socks) {
    let pacServer = pac.createServer()
    let httpPorts = mhttp.createServer(socks, () => {
        pacServer.close(() => optimal())         // 重新选择可用资源
    })
    pac.addPacUrl()
}

process.on('uncaughtException', (err) => {
    pac.removePacUrl()
    logger.error('uncaughtException' + err)
})
//程序正常退出时，恢复系统代理配置
process.on('SIGINT', () => {
    console.log(123);
    pac.removePacUrl(() => { process.exit() })
})