"use strict";

const fs = require('fs')
const path = require('path')
const dns = require('dns')
const ip = require('ip')
const {dnsServer} = require('../config')
const logger = require('../logger')
const geoipFile = path.join(__dirname, './GeoIP-CN')

let cidrs

/**
 * set DNS server manually
 */
if (dnsServer.length > 0) {
    dns.setServers(dnsServer)
}

/**
 * read china ips
* */
function readGeoIPList() {
    return fs.readFileSync(geoipFile, 'utf8').split('\n').filter(function (rx) {  // filter blank cidr
        return rx.length
    })
}

function update() {
    cidrs = new Set([...readGeoIPList()])
}

function isip(str) {
    return /^(([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])(\.(?!$)|$)){4}$/.test(str)
}

function direct(address, cb) {
    for (let cidr of cidrs) {
        if (ip.cidrSubnet(cidr).contains(address)) {
            return cb(true)    //direct
        }
    }
    return cb(false)           //tunnel
}

function checker(req, cb) {
    const hostname = req.headers.host.split(':')[0];    //host:port

    if (isip(hostname)) {
        const address = hostname
        return direct(address, cb)
    } else {
        dns.resolve4(hostname, (err, addresses) => {   //查询ipv4地址
            if (err) {
                return logger.error(`Http solve host: ${hostname} error`)
            }

            // only use the first address
            const address = addresses[0]
            return direct(address, cb)
        })
    }
}

logger.status(`Current DNS: ${dns.getServers()}`)
fs.watch(geoipFile, () => {
    update()
})
update()

module.exports = checker
