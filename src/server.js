const express = require('express');
const { urlencoded } = require('body-parser');
const path = require('path');
const debug = require('debug')('twilio-run:server');

const { functionToRoute } = require('./route');
const { getPaths } = require('./internal/runtime-paths');
const { createLogger } = require('./internal/request-logger');
const DEFAULT_PORT = process.env.PORT || 3000;

function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

function loadTwilioFunction(fnPath, config) {
  if (config.live) {
    debug('Uncached loading of %s', fnPath);
    return requireUncached(fnPath).handler;
  } else {
    return require(fnPath).handler;
  }
}

function createServer(port = DEFAULT_PORT, config) {
  config = {
    url: `http://localhost:${port}`,
    baseDir: process.cwd(),
    ...config
  };
  debug('Starting server with config: %o', config);

  const { ASSETS_PATH, FUNCTIONS_PATH } = getPaths(config.baseDir);
  const app = express();
  app.use(urlencoded({ extended: false }));

  if (config.logs) {
    app.use(createLogger(config));
  }

  debug('Serving assets from directory "%s"', ASSETS_PATH);
  app.use('/assets', express.static(ASSETS_PATH));
  app.set('port', port);
  app.all('/:name', (req, res) => {
    const functionPath = path.resolve(FUNCTIONS_PATH, `${req.params.name}.js`);
    try {
      debug('Load & route to function at "%s"', functionPath);
      const twilioFunction = loadTwilioFunction(functionPath, config);
      functionToRoute(twilioFunction, config)(req, res);
    } catch (err) {
      debug('Failed to retrieve function. %O', err);
      res.status(404).send(`Could not find function ${functionPath}`);
    }
  });
  return app;
}

module.exports = { createServer };
