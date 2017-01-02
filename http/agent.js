const http = require('http')
const url = require('url')
const net = require('net')
const Socks = require('socks')
const logger = require('../utils/logger')

let host = '127.0.0.1';

function getHeader(httpVersion) {
    return `HTTP/${httpVersion} 200 Connection Established\r\n` +
        'Proxy-agent: Jet Proxy\r\n' +
        '\r\n'
}

function agentHttp(sockPort) {
    return function (req, res) {
        const _url = url.parse(req.url)

        const hostname = _url.hostname
        const port = _url.port
        const path = _url.path
        const method = req.method
        const headers = req.headers

        const options = {
            hostname,
            port,
            path,
            method,
            headers
        }

        options.agent = new Socks.Agent({
            proxy: {
                ipaddress: host,
                port: sockPort,
                type: 5
            }
        }, false, false)

        const jetRequest = http.request(options, (_res) => {
            _res.pipe(res)
            res.writeHead(_res.statusCode, _res.headers)
        })

        jetRequest.on('error', (err) => {
            logger.error(err)
        })
        req.pipe(jetRequest)
    }
}

function agentHttps(sockPort) {
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
        }, (err, jetSocket, info) => {
            if (err) {
                logger.error(err)
            } else {
                // tell the client that the connection is established
                socket.write(getHeader(req.httpVersion))
                jetSocket.write(head)
                // creating pipes in both ends
                jetSocket.pipe(socket)
                socket.pipe(jetSocket)
            }
        })
    }
}

module.exports = {
    http: agentHttp,
    https: agentHttps
};
