import { resolve } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import logSymbols from 'log-symbols';
import { fileExists } from '../../utils/fs';
import debugModule from 'debug';

const debug = debugModule('twilio-run:cli:config');

type NgrokConfig = {
  addr: number;
  subdomain?: string;
};

async function getUrl(cli, port) {
  let url = `http://localhost:${port}`;
  if (typeof cli.flags.ngrok !== 'undefined') {
    debug('Starting ngrok tunnel');
    const ngrokConfig: NgrokConfig = { addr: port };
    if (cli.flags.ngrok.length > 0) {
      ngrokConfig.subdomain = cli.flags.ngrok;
    }

    url = await require('ngrok').connect(ngrokConfig);
    debug('ngrok tunnel URL: %s', url);
  }

  return url;
}

function getPort(cli) {
  let port = process.env.PORT || 3000;
  if (typeof cli.flags.port !== 'undefined') {
    port = parseInt(cli.flags.port, 10);
    debug('Overriding port via command-line flag to %d', port);
  }
  if (typeof port === 'string') {
    port = parseInt(port, 10);
  }
  return port;
}

async function getEnvironment(cli, baseDir) {
  let env = {};
  if (cli.flags.loadLocalEnv) {
    debug('Loading local environment variables');
    env = { ...process.env };
  }

  const envFilePath = cli.flags.env || '.env';
  const fullEnvPath = resolve(baseDir || process.cwd(), envFilePath);
  if (await fileExists(fullEnvPath)) {
    try {
      debug(`Read .env file at "%s"`, fullEnvPath);
      const envContent = readFileSync(fullEnvPath, 'utf8');
      const envValues = dotenv.parse(envContent);
      for (const [key, val] of Object.entries(envValues)) {
        env[key] = val;
      }
    } catch (err) {
      console.error(logSymbols.error, 'Failed to read .env file');
    }
  } else {
    if (cli.flags.env) {
      console.error(logSymbols.error, 'Failed to find .env file');
    }
    debug('Not loading a .env file');
  }
  return env;
}

function getBaseDirectory(cli) {
  let baseDir = process.cwd();
  if (cli.dir) {
    baseDir = cli.dir;
    debug('Set base directory based on input to "%s"', baseDir);
  }
  return baseDir;
}

function getInspectInfo(cli) {
  if (typeof cli.flags.inspectBrk !== 'undefined') {
    return {
      hostPort: cli.flags.inspect,
      break: true,
    };
  } else if (typeof cli.flags.inspect !== 'undefined') {
    return { hostPort: cli.flags.inspect, break: false };
  }
  return undefined;
}

export type CliConfig = {
  inspect?: {
    hostPort: string;
    break: boolean;
  };
  baseDir: string;
  env: {
    [key: string]: string;
  };
  port: number;
  url: string;
  detailedLogs: boolean;
  live: boolean;
  logs: boolean;
  legacyMode: boolean;
  appName: string;
};

export async function getConfigFromCli(cli) {
  const config = {} as CliConfig;

  config.inspect = getInspectInfo(cli);
  config.baseDir = getBaseDirectory(cli);
  config.env = await getEnvironment(cli, config.baseDir);
  config.port = getPort(cli);
  config.url = await getUrl(cli, config.port);
  config.detailedLogs = cli.flags.detailedLogs;
  config.live = cli.flags.live;
  config.logs = cli.flags.logs;
  config.legacyMode = cli.flags.legacyMode;
  config.appName = 'twilio-run';

  return config;
}
