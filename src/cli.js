const meow = require('meow');
const boxen = require('boxen');
const debug = require('debug')('twilio-run:cli');

const { createServer } = require('./server');
const { startInspector } = require('./utils/inspector');
const meowConfig = require('./cli/meow-config');
const { getConfigFromCli } = require('./cli/config');
const { getRouteInfo } = require('./cli/route-info');

const cli = meow(meowConfig.usage, meowConfig.config);

async function run() {
  const config = await getConfigFromCli(cli);
  debug('Determined configuration: %o', config);
  process.title = config.appName;
  process.env = { ...process.env, ...config.env }

  if (config.inspect) {
    debug(
      'Starting inspector mode with following configuration: %o',
      config.inspect
    );
    startInspector(config.inspect.hostPort, config.inspect.break);
  }

  const app = createServer(config.port, config);
  debug('Start server on port %d', config.port);
  return new Promise(resolve => {
    app.listen(config.port, () => {
      const info = getRouteInfo(config);
      console.log(boxen(info, { padding: 1 }));
      resolve(app);
    });
  });
}

module.exports = { run };
