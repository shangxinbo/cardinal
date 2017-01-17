require('colors')

//TODO: 规范logger类型
function request(req, type) {
    if (type === 'tunnel') {
        console.log(`> ${req.connection.remoteAddress} TUNNEL ${req.headers.host}`.yellow)
    } else if (type === 'direct') {
        console.log(`> ${req.connection.remoteAddress} DIRECT ${req.headers.host}`.green)
    }
}

function doing(log = '') {
    console.log(`[INFO] ${log}`.cyan)
}

function error(log = '') {
    console.log(`[ERROR] ${log}`.yellow)
}
function status(log = '') {
    console.log(`[STATUS] ${log}`.gray)
}


module.exports = {
    request,
    doing,
    error,
    status
}
