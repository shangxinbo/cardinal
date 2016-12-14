const createServer = require('http').createServer;
const getPACFileContent = require('./gfwlistUtils').getPACFileContent;

const NAME = 'pac_server';

// TODO: async this
// eslint-disable-next-line
exports.createPACServer = function(config, logger) {
  const pacFileContent = getPACFileContent(config);
  const HOST = `${config.localAddr}:${config.pacServerPort}`;

  const server = createServer((req, res) => {
    res.write(pacFileContent);
    res.end();
  });

  server.on('error', (err) => {
    logger.error(`${NAME} got error: ${err.stack}`);
  });

  server.listen(config.pacServerPort);

  if (logger) {
    logger.verbose(`${NAME} is listening on ${HOST}`);
  }

  return server;
}
