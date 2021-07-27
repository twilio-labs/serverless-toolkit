import { Server } from 'http';
import inquirer from 'inquirer';
import { Argv } from 'yargs';
import { checkForValidRuntimeHandlerVersion } from '../checks/check-runtime-handler';
import checkLegacyConfig from '../checks/legacy-config';
import checkNodejsVersion from '../checks/nodejs-version';
import checkProjectStructure from '../checks/project-structure';
import { getConfigFromCli, getUrl, StartCliFlags } from '../config/start';
import { ALL_FLAGS, BASE_CLI_FLAG_NAMES, getRelevantFlags } from '../flags';
import { printRouteInfo } from '../printers/start';
import { createLocalDevelopmentServer } from '../runtime/server';
import { startInspector } from '../runtime/utils/inspector';
import { getDebugFunction, logger, setLogLevelByName } from '../utils/logger';
import { ExternalCliOptions } from './shared';
import { CliInfo } from './types';
import { getFullCommand } from './utils';

const debug = getDebugFunction('twilio-run:start');

type ServerError = Error & {
  code: string;
};

function randomPort() {
  // Returns a random port number higher than 1024 and lower than 65536.
  return Math.floor(Math.random() * (65535 - 1025) + 1025);
}

function validatePortNumber(input: string) {
  const newPortNumber = parseInt(input, 10);
  if (
    !Number.isNaN(newPortNumber) &&
    newPortNumber <= 65535 &&
    newPortNumber > 1024
  ) {
    return true;
  }
  return 'Please enter a port number between 1025 and 65535.';
}

export async function handler(
  argv: StartCliFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<void> {
  setLogLevelByName(argv.logLevel);

  checkNodejsVersion();
  await checkLegacyConfig(argv.cwd, false);

  const config = await getConfigFromCli(argv, cliInfo, externalCliOptions);

  if (!checkForValidRuntimeHandlerVersion(config.pkgJson)) {
    process.exitCode = 1;
    return;
  }

  const command = getFullCommand(argv);
  const directories = {
    assetsDirectories: config.assetsFolderName
      ? [config.assetsFolderName]
      : undefined,
    functionsDirectories: config.functionsFolderName
      ? [config.functionsFolderName]
      : undefined,
  };
  await checkProjectStructure(config.baseDir, command, false, directories);

  debug('Determined configuration: %p', config);
  process.title = config.appName;

  debug('Set environment variables as: %r', config.env);
  process.env = config.env;

  if (config.inspect) {
    debug(
      'Starting inspector mode with following configuration: %p',
      config.inspect
    );
    startInspector(config.inspect.hostPort, config.inspect.break);
  }

  const app = await createLocalDevelopmentServer(config.port, config);
  let server: Server;
  debug('Start server on port %d', config.port);
  return new Promise((resolve, reject) => {
    let attempts = 1;
    const MAX_ATTEMPTS = 3;
    const serverStartedSuccessfully = (port?: number) => {
      return async () => {
        if (port) {
          config.port = port;
        }
        try {
          config.url = await getUrl(argv, config.port);
          printRouteInfo(config);
          resolve();
        } catch (error) {
          server.close(() => {
            if (error.msg && error.details && error.details.err) {
              logger.error(`${error.msg}\n\n${error.details.err}`);
            } else {
              logger.error(error.message);
            }
            process.exit(1);
          });
        }
      };
    };
    const handleServerError = async (error: ServerError) => {
      if (error.code === 'EADDRINUSE') {
        if (attempts > MAX_ATTEMPTS) {
          logger.info('Too many retries. Please check your available ports.');
          process.exit(1);
        } else {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              default: randomPort(),
              name: 'newPortNumber',
              message: `Port ${config.port} is already in use. Choose a new port number:`,
              validate: validatePortNumber,
            },
          ]);
          attempts += 1;
          server = app.listen(
            answers.newPortNumber,
            serverStartedSuccessfully(answers.newPortNumber)
          );
          server.on('error', handleServerError);
        }
      } else {
        reject(error);
      }
    };

    server = app.listen(config.port, serverStartedSuccessfully());
    server.on('error', handleServerError);
  });
}

export const cliInfo: CliInfo = {
  options: {
    ...getRelevantFlags([
      ...BASE_CLI_FLAG_NAMES,
      'load-local-env',
      'port',
      'ngrok',
      'logs',
      'detailed-logs',
      'live',
      'inspect',
      'inspect-brk',
      'legacy-mode',
      'assets-folder',
      'functions-folder',
      'fork-process',
    ]),
    cwd: {
      ...ALL_FLAGS['cwd'],
      describe:
        'Alternative way to define the directory to start the server in. Overrides the [dir] argument passed.',
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
