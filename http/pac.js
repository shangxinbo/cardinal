/**
 * NAME 2016/12/30
 * DATE 2016/12/30
 * AUTHOR shangxinbo
 */

const createServer = require('http').createServer;
const logger = require('../logger');
const getPACFileContent = require('./gfwlistUtils').getPACFileContent;

exports.createPACServer = function() {
    const pacFileContent = getPACFileContent();

    const server = createServer((req, res) => {
        res.write(pacFileContent);
        res.end();
    });

    server.on('error', err => {
        logger.error(`PAC server got error: ${err.stack}`);
    });

    server.listen(LOCAL_CONF.pacPort);

    logger.status(`PAC server is listening on 127.0.0.1:${LOCAL_CONF.pacPort}`);

    return server;
}