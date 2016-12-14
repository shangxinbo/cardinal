/**
 * NAME 2016/12/14
 * DATE 2016/12/14
 * AUTHOR shangxinbo
 */

const process = require('process')
const program = require('commander')

const jet = require('jet');

const defaultHost = '0.0.0.0'
const defaultPort = 9527

program
    .option('-h, --host <host>', `host address, default value: ${defaultHost}`)
    .option('-p, --port <port>', `port number, default value: ${defaultPort}`, parseInt)
    .parse(process.argv)


const host = program.host || defaultHost
const port = program.port || defaultPort

jet.listen(port, host, () => {
    console.log(`Listening on ${host}:${port}...`)
})

jet.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        process.exit(1)
    }
})