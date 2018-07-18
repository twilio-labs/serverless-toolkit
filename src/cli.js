const meow = require('meow');
const boxen = require('boxen');
const debug = require('debug')('twilio-run:cli');

const { runServer } = require('./server');
const { startInspector } = require('./utils/inspector');
const meowConfig = require('./cli/meow-config');
const { getConfigFromCli } = require('./cli/config');
const { getRouteInfo } = require('./cli/route-info');

const cli = meow(meowConfig.usage, meowConfig.config);

async function run() {
  const config = await getConfigFromCli(cli);
  debug('Determined configuration: %o', config);
  process.title = config.appName;

  if (config.inspect) {
    debug(
      'Starting inspector mode with following configuration: %o',
      config.inspect
    );
    startInspector(config.inspect.hostPort, config.inspect.break);
  }

  const app = await runServer(config.port, config);
  const info = getRouteInfo(config);
  console.log(boxen(info, { padding: 1 }));
}

module.exports = { run };
