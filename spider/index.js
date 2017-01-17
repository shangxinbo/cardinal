const fs = require('fs')
const path = require('path')
const dns = require('dns')
const http = require('http')
const https = require('https')
const url = require('url')
const sources = require('./source')
const logger = require('../utils/logger')

/**
 * @method store shadowsocks server list to a file for cache
 * @param {Array} arr
 * @param {Function} callback 
 */
function store(arr, callback) {
    let c = arr.length
    for (let i = 0; i < arr.length; i++) {
        dns.lookup(arr[i].host, (err, address, family) => {
            c--
            if (err) logger.error(err)
            arr[i].host = address
            if (c == 0) {
                fs.writeFileSync(path.join(__dirname, '../config/server.json'), JSON.stringify({ "list": arr }))
                callback()
            }
        })
    }
}

function getData(_url, callback) {
    let protocol = url.parse(_url).protocol
    if (protocol == 'https:') {
        let req = https.get(_url, (res) => {
            if (res.statusCode == 200) {
                res.setEncoding('utf-8')
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk
                }).on('end', () => {
                    if (callback) callback(null, data)
                })
            } else {
                if (callback) callback('response status not 200')
            }
        }).on('error', (err) => {
            if (callback) callback(err)
        })
        req.setTimeout(1500, () => {
            req.abort()
            if (callback) callback('err')
        })
    } else {  // http
        let req = http.get(_url, (res) => {
            if (res.statusCode == 200) {
                res.setEncoding('utf-8')
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk
                }).on('end', () => {
                    if (callback) callback(null, data)
                })
            } else {
                if (callback) callback('response status not 200')
            }
        }).on('error', (err) => {
            if (callback) callback(err)
        })
        req.setTimeout(1500, () => {
            req.abort()
            if (callback) callback('err')
        })
    }
}

//update server list config/server.json 
exports.update = function (callback) {
    let dymicArr = []
    if (sources instanceof Array && sources.length > 0) {
        let counter = sources.length                 //爬虫结果计数
        for (let i = 0; i < sources.length; i++) {
            getData(sources[i].url, (err, data) => {
                counter--
                if (!err) {
                    let arr = sources[i].deXml(data)
                    if (arr) {
                        dymicArr = dymicArr.concat(arr)
                    }
                }
                if (counter == 0) {
                    store(dymicArr, callback)
                }
            })
        }
    } else {
        logger.error('the source of servers is null,please check spider/source.js')
    }
}