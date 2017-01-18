const http = require('http')
const agent = require('./agent')
const logger = require('../utils/logger')
const config = require('../config/local.json')

/**
 * @param {number} SOCKS port 
 * @param {function} callback HTTP SERVER 异常回调函数
*/
exports.createServer = function (socks, callback) {
    if (socks) {
        let proxy = http.createServer()
        proxy.on('request', (req, res) => {           //http request
            agent.http(socks, callback)(req, res)
        }).on('connect', (req, socket, head) => {     //https request
            agent.https(socks, callback)(req, socket, head)
        }).on('error', (err) => {
            logger.error('http server error' + err)
            proxy.close(() => {
                if (callback) callback()
            })
        }).on('clientError', (err, socks) => {  // client browser throw error 
            logger.error('clientError' + err)
            if (callback) callback()
        })
        proxy.listen(config.httpPort, config.host, () => {
            logger.status(`HTTP listening on ${config.host}:${config.httpPort}...`)
        })
        return proxy
    } else {
        logger.error('socks proxy is null')
    }
}