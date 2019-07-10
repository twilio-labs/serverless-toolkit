import { EnvironmentVariables } from '@twilio-labs/serverless-api';
import debugModule from 'debug';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import logSymbols from 'log-symbols';
import path, { resolve } from 'path';
import { Arguments } from 'yargs';
import { EnvironmentVariablesWithAuth } from '../../types/generic';
import { fileExists } from '../../utils/fs';

const debug = debugModule('twilio-run:cli:config');

type NgrokConfig = {
  addr: string | number;
  subdomain?: string;
};

type InspectInfo = {
  hostPort: string;
  break: boolean;
};

export type StartCliConfig = {
  inspect?: InspectInfo;
  baseDir: string;
  env: EnvironmentVariablesWithAuth;
  port: number;
  url: string;
  detailedLogs: boolean;
  live: boolean;
  logs: boolean;
  legacyMode: boolean;
  appName: string;
};

export type StartCliFlags = Arguments<{
  dir?: string;
  cwd?: string;
  loadLocalEnv: boolean;
  env?: string;
  port: string;
  ngrok?: string;
  logs: boolean;
  detailedLogs: boolean;
  live: boolean;
  inspect?: string;
  inspectBrk?: string;
  legacyMode: boolean;
}>;

export type WrappedStartCliFlags = {
  flags: StartCliFlags;
};

export async function getUrl(cli: WrappedStartCliFlags, port: string | number) {
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

export function getPort(cli: WrappedStartCliFlags): number {
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

export async function getEnvironment(
  cli: WrappedStartCliFlags,
  baseDir: string
): Promise<EnvironmentVariables> {
  let env: EnvironmentVariables = {};
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

export function getBaseDirectory(cli: WrappedStartCliFlags): string {
  let baseDir = process.cwd();
  if (cli.flags.cwd) {
    baseDir = path.resolve(cli.flags.cwd);
    debug('Set base directory based on input to "%s"', baseDir);
  } else if (cli.flags.dir) {
    baseDir = path.resolve(cli.flags.dir);
    debug('Set base directory based on input to "%s"', baseDir);
  }
  return baseDir;
}

export function getInspectInfo(
  cli: WrappedStartCliFlags
): InspectInfo | undefined {
  if (typeof cli.flags.inspectBrk !== 'undefined') {
    return {
      hostPort: cli.flags.inspectBrk,
      break: true,
    };
  } else if (typeof cli.flags.inspect !== 'undefined') {
    return { hostPort: cli.flags.inspect, break: false };
  }
  return undefined;
}

export async function getConfigFromCli(cli: {
  flags: StartCliFlags;
}): Promise<StartCliConfig> {
  const config = {} as StartCliConfig;

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
