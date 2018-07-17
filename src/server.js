const express = require('express');
const { urlencoded } = require('body-parser');
const path = require('path');

const { functionToRoute } = require('./route');
const { getPaths } = require('./internal/runtime-paths');
const DEFAULT_PORT = process.env.PORT || 3000;

function runServer(port = DEFAULT_PORT, config) {
  config = {
    url: `http://localhost:${port}`,
    baseDir: process.cwd(),
    ...config
  };

  return new Promise((resolve, reject) => {
    try {
      const { ASSETS_PATH, FUNCTIONS_PATH } = getPaths(config.baseDir);
      const app = express();
      app.use(urlencoded({ extended: false }));

      app.use(express.static(ASSETS_PATH));
      app.set('port', port);
      app.all('/:name', (req, res) => {
        const functionPath = path.resolve(
          FUNCTIONS_PATH,
          `${req.params.name}.js`
        );
        try {
          const twilioFunction = require(functionPath).handler;
          functionToRoute(twilioFunction, config)(req, res);
        } catch (err) {
          console.error(err);
          res.status(404).send(`Could not find function ${functionPath}`);
        }
      });

      app.listen(port, () => resolve(app));
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { runServer };
