require('colors')

function error(log = '') {
    console.log(`[ERROR] ${log}`.yellow)
}
function status(log = '') {
    console.log(`[STATUS] ${log}`.gray)
}

module.exports = {
    error,
    status
}
