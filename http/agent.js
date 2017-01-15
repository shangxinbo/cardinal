const http = require('http')
const url = require('url')
const Socks = require('socks')
const logger = require('../utils/logger')
const host = require('../config/local.json').host

exports.http = function (sockPort, callback) {
    return function (req, res) {
        const _url = url.parse(req.url)

        let options = {
            hostname: _url.hostname,
            port: _url.port,
            path: _url.path,
            method: _url.method,
            headers: req.headers
        }

        options.agent = new Socks.Agent({
            proxy: {
                ipaddress: host,
                port: sockPort,
                type: 5
            }
        }, false, false)

        const _req = http.request(options, (_res) => {
            res.writeHead(_res.statusCode, _res.headers)
            _res.pipe(res)
        }).on('error', (err) => {
            logger.error(`Agent http ${err}`)
            if (callback) callback()
            res.end()
        })
        req.pipe(_req)
    }
}

exports.https = function (sockPort, callback) {
    return function (req, socket, head) {
        const _url = url.parse(`https://${req.url}`)

        const hostname = _url.hostname
        const port = _url.port
        Socks.createConnection({
            proxy: {
                ipaddress: host,
                port: sockPort,
                type: 5
            },
            target: {
                host: hostname,
                port: port
            },
            command: 'connect'
        }, (err, _socket, info) => {
            if (err) {
                logger.error(`Agent https ${err}`)
                if (callback) callback()
            } else {
                // tell the client that the connection is established
                socket.write(`HTTP/${req.httpVersion} 200 Connection Established\r\n\r\n`)
                _socket.write(head)
                _socket.pipe(socket)      // creating pipes in both ends
                socket.pipe(_socket)
            }
        })
    }
}
