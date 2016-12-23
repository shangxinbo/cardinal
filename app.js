/**
 * NAME 2016/12/14
 * DATE 2016/12/14
 * AUTHOR shangxinbo
 */


const jet = require('./jet/jet');

const host = '127.0.0.1';
const port = 9527;

jet.listen(port, host, () => {
    console.log(`Listening on ${host}:${port}...`)
})

jet.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        process.exit(1)
    }
})