/*eslint no-loop-func: "off"*/
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
    if (c > 0) {
        for (let i = 0; i < arr.length; i++) {
            dns.lookup(arr[i].host, (err, address, family) => {
                c--
                if (address && !err) {
                    arr[i].host = address
                } else {
                    arr.splice(i, 1)
                }
                if (c == 0) {
                    callback(null, arr)
                }
            })
        }
    } else {
        if (callback) callback('no server can use')
    }
}

function getData(_url, callback) {
    let protocol = url.parse(_url).protocol
    let request = (protocol == 'https:') ? https : http
    let req = request.get(_url, (res) => {
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
    }).on('abort', () => {
        if (callback) callback('请求超时')
    })
    req.setTimeout(4500, () => {
        req.abort()
    })
}

// climbing server lists
exports.serverList = function (callback) {
    let dymicArr = []
    let counter = sources.length
    if (sources instanceof Array && counter > 0) {
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