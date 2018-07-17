const express = require('express');
const { urlencoded } = require('body-parser');
const path = require('path');
const debug = require('debug')('twilio-run:server');

const { functionToRoute } = require('./route');
const { getPaths } = require('./internal/runtime-paths');
const DEFAULT_PORT = process.env.PORT || 3000;

function runServer(port = DEFAULT_PORT, config) {
  config = {
    url: `http://localhost:${port}`,
    baseDir: process.cwd(),
    ...config
  };
  debug('Starting server with config: %o', config);

  return new Promise((resolve, reject) => {
    try {
      const { ASSETS_PATH, FUNCTIONS_PATH } = getPaths(config.baseDir);
      const app = express();
      app.use(urlencoded({ extended: false }));

      debug('Serving assets from directory "%s"', ASSETS_PATH);
      app.use(express.static(ASSETS_PATH));
      app.set('port', port);
      app.all('/:name', (req, res) => {
        const functionPath = path.resolve(
          FUNCTIONS_PATH,
          `${req.params.name}.js`
        );
        try {
          debug('Load & route to function at "%s"', functionPath);
          const twilioFunction = require(functionPath).handler;
          functionToRoute(twilioFunction, config)(req, res);
        } catch (err) {
          debug('Failed to retrieve function. %O', err);
          res.status(404).send(`Could not find function ${functionPath}`);
        }
      });

      debug('Start express server on port %d', port);
      app.listen(port, () => resolve(app));
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { runServer };
