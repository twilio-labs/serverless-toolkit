import { EnvironmentVariables } from '@twilio-labs/serverless-api';
import dotenv from 'dotenv';
import { readFile } from 'fs';
import { promisify } from 'util';
const readFilePromise = promisify(readFile);
import path, { resolve, join } from 'path';
import { homedir } from 'os';
import { Arguments } from 'yargs';
import { ExternalCliOptions, SharedFlags } from '../commands/shared';
import { CliInfo } from '../commands/types';
import { EnvironmentVariablesWithAuth } from '../types/generic';
import { fileExists } from '../utils/fs';
import { getDebugFunction, logger } from '../utils/logger';
import { readSpecializedConfig } from './global';
import { mergeFlagsAndConfig } from './utils/mergeFlagsAndConfig';
import { INgrokOptions } from 'ngrok';
import { parse } from 'yaml';

const debug = getDebugFunction('twilio-run:cli:config');

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
  assetsFolderName?: string;
  functionsFolderName?: string;
  forkProcess: boolean;
};

export type StartCliFlags = Arguments<
  SharedFlags & {
    dir?: string;
    cwd?: string;
    loadLocalEnv: boolean;
    env?: string;
    port: string;
    ngrok?: string | boolean;
    ngrokConfig?: string;
    ngrokName?: string;
    logs: boolean;
    detailedLogs: boolean;
    live: boolean;
    inspect?: string;
    inspectBrk?: string;
    legacyMode: boolean;
    assetsFolder?: string;
    functionsFolder?: string;
    experimentalForkProcess: boolean;
  }
>;

export type WrappedStartCliFlags = {
  flags: StartCliFlags;
};

export async function getUrl(cli: StartCliFlags, port: string | number) {
  let url = `http://localhost:${port}`;
  if (typeof cli.ngrok !== 'undefined') {
    debug('Starting ngrok tunnel');
    // Setup default ngrok config, setting the protocol and the port number to
    // forward to.
    const defaultConfig: INgrokOptions = { addr: port, proto: 'http' };
    let tunnelConfig = defaultConfig;
    let ngrokConfig;
    if (typeof cli.ngrokConfig === 'string') {
      // If we set a config path then try to load that config. If the config
      // fails to load then we'll try to load the default config instead.
      const configPath = join(cli.cwd || process.cwd(), cli.ngrokConfig);
      try {
        ngrokConfig = parse(await readFilePromise(configPath, 'utf-8'));
      } catch (err) {
        logger.warn(`Could not find ngrok config file at ${configPath}`);
      }
    }
    if (!ngrokConfig) {
      // Try to load default config. If there is no default config file, set
      // `ngrokConfig` to be an empty object.
      const configPath = join(homedir(), '.ngrok2', 'ngrok.yml');
      try {
        ngrokConfig = parse(await readFilePromise(configPath, 'utf-8'));
      } catch (err) {
        ngrokConfig = {};
      }
    }
    if (
      typeof cli.ngrokName === 'string' &&
      typeof ngrokConfig.tunnels === 'object'
    ) {
      // If we've asked for a named ngrok tunnel and there are available tunnels
      // in the config, then set the `tunnelConfig` to the options from the
      // config, overriding the addr and proto to the defaults.
      tunnelConfig = { ...ngrokConfig.tunnels[cli.ngrokName], ...tunnelConfig };
      if (!tunnelConfig) {
        // If the config does not include the named tunnel, then set it back to
        // the default options.
        logger.warn(
          `Could not find config for named tunnel "${cli.ngrokName}". Falling back to other options.`
        );
        tunnelConfig = defaultConfig;
      }
    }
    if (typeof ngrokConfig.authtoken === 'string') {
      // If there is an authtoken in the config, add it to the tunnel config.
      tunnelConfig.authToken = ngrokConfig.authtoken;
    }
    if (typeof cli.ngrok === 'string' && cli.ngrok.length > 0) {
      // If we've asked for a custom subdomain, override the tunnel config with
      // it.
      tunnelConfig.subdomain = cli.ngrok;
    }
    const ngrok = require('ngrok');
    try {
      // Try to open the ngrok tunnel.
      url = await ngrok.connect(tunnelConfig);
    } catch (error) {
      // If it fails, it is likely to be because the tunnel config we pass is
      // not allowed (e.g. using a custom subdomain without an authtoken). The
      // error message from ngrok itself should describe the issue.
      logger.warn(error.message);
      if (
        typeof error.details !== 'undefined' &&
        typeof error.details.err !== 'undefined'
      ) {
        logger.warn(error.details.err);
      }
    }
    debug('ngrok tunnel URL: %s', url);
  }

  return url;
}

export function getPort(cli: StartCliFlags): number {
  let port = process.env.PORT || 3000;
  if (typeof cli.port !== 'undefined') {
    port = parseInt(cli.port, 10);
    debug('Overriding port via command-line flag to %d', port);
  }
  if (typeof port === 'string') {
    port = parseInt(port, 10);
  }
  return port;
}

export async function getEnvironment(
  cli: StartCliFlags,
  baseDir: string
): Promise<EnvironmentVariables> {
  let env: EnvironmentVariables = {};
  if (cli.loadLocalEnv) {
    debug('Loading local environment variables');
    env = { ...process.env };
  }

  const envFilePath = cli.env || '.env';
  const fullEnvPath = resolve(baseDir || process.cwd(), envFilePath);
  if (await fileExists(fullEnvPath)) {
    try {
      debug(`Read .env file at "%s"`, fullEnvPath);
      const envContent = await readFilePromise(fullEnvPath, 'utf8');
      const envValues = dotenv.parse(envContent);
      for (const [key, val] of Object.entries(envValues)) {
        env[key] = val;
      }
    } catch (err) {
      logger.error('Failed to read .env file');
    }
  } else {
    if (cli.env) {
      logger.error('Failed to find .env file');
    }
    debug('Not loading a .env file');
  }
  return env;
}

export function getBaseDirectory(cli: StartCliFlags): string {
  let baseDir = process.cwd();
  if (cli.cwd) {
    baseDir = path.resolve(cli.cwd);
    debug('Set base directory based on input to "%s"', baseDir);
  } else if (cli.dir) {
    baseDir = path.resolve(cli.dir);
    debug('Set base directory based on input to "%s"', baseDir);
  }
  return baseDir;
}

export function getInspectInfo(cli: StartCliFlags): InspectInfo | undefined {
  if (typeof cli.inspectBrk !== 'undefined') {
    return {
      hostPort: cli.inspectBrk,
      break: true,
    };
  } else if (typeof cli.inspect !== 'undefined') {
    return { hostPort: cli.inspect, break: false };
  }
  return undefined;
}

export async function getConfigFromCli(
  flags: StartCliFlags,
  cliInfo: CliInfo = { options: {} },
  externalCliOptions?: ExternalCliOptions
): Promise<StartCliConfig> {
  const configFlags = readSpecializedConfig(
    flags.cwd || process.cwd(),
    flags.config,
    'startConfig',
    {
      projectId:
        (externalCliOptions && externalCliOptions.accountSid) || undefined,
    }
  ) as StartCliFlags;
  const cli = mergeFlagsAndConfig(configFlags, flags, cliInfo);
  const config = {} as StartCliConfig;

  config.inspect = getInspectInfo(cli);
  config.baseDir = getBaseDirectory(cli);
  config.env = await getEnvironment(cli, config.baseDir);
  config.port = getPort(cli);
  config.detailedLogs = cli.detailedLogs;
  config.live = cli.live;
  config.logs = cli.logs;
  config.legacyMode = cli.legacyMode;
  config.appName = 'twilio-run';
  config.assetsFolderName = cli.assetsFolder;
  config.functionsFolderName = cli.functionsFolder;
  config.forkProcess = cli.experimentalForkProcess;

  return config;
}
