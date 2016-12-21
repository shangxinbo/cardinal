const createServer = require('http').createServer;
const getPACFileContent = require('./gfwlistUtils').getPACFileContent;

exports.createPACServer = function (config) {
    const pacFileContent = getPACFileContent(config);
    const HOST = `${config.localAddr}:${config.pacServerPort}`;
    const server = createServer((req, res) => {
        res.write(pacFileContent);
        res.end();
    });

    server.on('error', (err) => {
        console.log(err);
    });

    server.listen(config.pacServerPort);

    return server;
}
