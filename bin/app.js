#!/usr/bin/env node
/*eslint no-loop-func: "off"*/
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
let updateIPs = false

if (argv.indexOf('upip') > -1) {
    updateIPs = true
}

init()

function init(set) {
    spider.serverList((err,arr) => {
        socksPorts = msocks.createServer(arr)
        optimal()
    })
}

//get best socks port 
function optimal() {
    let httpRunning = false             // to prevent mutiple http create
    if (socksPorts.length <= 0) {
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
        pacServer.close(() => optimal())         //reset the best socks and create a new http server
    })
    pac.addPacUrl()
}

//Once process exit recovery the pac url in OS 
process.on('uncaughtException', (err) => {
    pac.removePacUrl()
    logger.error('uncaughtException' + err)
})
process.on('SIGINT', () => {
    pac.removePacUrl(() => { process.exit() })
})