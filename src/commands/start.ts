import debug from 'debug';
import { createServer } from '../runtime/server';
import { startInspector } from '../runtime/utils/inspector';
import { getConfigFromCli, StartCliFlags } from '../runtime/cli/config';
import { printRouteInfo, printVersionWarning } from '../printers/start';
import { Argv } from 'yargs';
import { CliInfo } from './types';

const log = debug('twilio-run:start');

export async function handler(argv: StartCliFlags): Promise<void> {
  const nodeVersion = process.versions.node;
  if (!nodeVersion.startsWith('8.10')) {
    printVersionWarning(nodeVersion);
  }

  const cli = {
    flags: argv,
  };

  const config = await getConfigFromCli(cli);
  log('Determined configuration: %o', config);
  process.title = config.appName;

  log('Set environment variables as: %o', config.env);
  process.env = config.env;

  if (config.inspect) {
    log(
      'Starting inspector mode with following configuration: %o',
      config.inspect
    );
    startInspector(config.inspect.hostPort, config.inspect.break);
  }

  const app = await createServer(config.port, config);
  log('Start server on port %d', config.port);
  return new Promise(resolve => {
    app.listen(config.port, async () => {
      printRouteInfo(config);
      resolve();
    });
  });
}

export const cliInfo: CliInfo = {
  options: {
    'load-local-env': {
      alias: 'f',
      default: false,
      type: 'boolean',
      describe: 'Includes the local environment variables',
    },
    cwd: {
      type: 'string',
      describe:
        'Alternative way to define the directory to start the server in. Overrides the [dir] argument passed.',
    },
    env: {
      alias: 'e',
      type: 'string',
      describe: 'Loads .env file, overrides local env variables',
    },
    port: {
      alias: 'p',
      type: 'string',
      describe: 'Override default port of 3000',
      default: '3000',
      requiresArg: true,
    },
    ngrok: {
      type: 'string',
      describe: 'Uses ngrok to create and outfacing url',
    },
    logs: {
      type: 'boolean',
      default: true,
      describe: 'Toggles request logging',
    },
    'detailed-logs': {
      type: 'boolean',
      default: false,
      describe:
        'Toggles detailed request logging by showing request body and query params',
    },
    live: {
      type: 'boolean',
      default: false,
      describe: 'Always serve from the current functions (no caching)',
    },
    inspect: {
      type: 'string',
      describe: 'Enables Node.js debugging protocol',
    },
    'inspect-brk': {
      type: 'string',
      describe:
        'Enables Node.js debugging protocol, stops executioin until debugger is attached',
    },
    'legacy-mode': {
      type: 'boolean',
      describe:
        'Enables legacy mode, it will prefix your asset paths with /assets',
    },
  },
};

function optionBuilder(yargs: Argv<any>): Argv<StartCliFlags> {
  yargs = yargs
    .example('$0', 'Serves all functions in current functions subdirectory')
    .example('$0 start demo', 'Serves all functions in demo/functions')
    .example('PORT=9000 $0', 'Serves functions on port 9000')
    .example('$0 start --port=4200', 'Serves functions on port 4200')
    .example('$0 start --env', 'Loads environment variables from .env file')
    .example(
      '$0 start --ngrok',
      'Exposes the Twilio functions via ngrok to share them'
    )
    .epilog('for more information, check out https://twil.io/local-functions');

  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['start [dir]', '$0 [dir]'];
export const describe = 'Starts local Twilio Functions development server';
export const builder = optionBuilder;
