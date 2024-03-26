import { EnvironmentVariables } from '@twilio-labs/serverless-api';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path, { resolve } from 'path';
import { Arguments } from 'yargs';
import { ExternalCliOptions } from '../commands/shared';
import { CliInfo } from '../commands/types';
import { AllAvailableFlagTypes, SharedFlagNames } from '../flags';
import { EnvironmentVariablesWithAuth } from '../types/generic';
import { fileExists } from '../utils/fs';
import { getDebugFunction, logger } from '../utils/logger';
import { readPackageJsonContent } from './utils';
import { readSpecializedConfig } from './global';
import { mergeFlagsAndConfig } from './utils/mergeFlagsAndConfig';
import { PackageJson } from 'type-fest';

const debug = getDebugFunction('twilio-run:cli:config');

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
  assetsFolderName?: string;
  functionsFolderName?: string;
  forkProcess: boolean;
  pkgJson: PackageJson;
};

export type ConfigurableStartCliFlags = Pick<
  AllAvailableFlagTypes,
  | SharedFlagNames
  | 'loadLocalEnv'
  | 'port'
  | 'ngrok'
  | 'logs'
  | 'detailedLogs'
  | 'live'
  | 'inspect'
  | 'inspectBrk'
  | 'legacyMode'
  | 'assetsFolder'
  | 'functionsFolder'
  | 'forkProcess'
>;
export type StartCliFlags = Arguments<
  ConfigurableStartCliFlags & { dir?: string }
>;

export type WrappedStartCliFlags = {
  flags: StartCliFlags;
};

export async function getUrl(cli: StartCliFlags, port: string | number) {
  let url = `http://localhost:${port}`;
  if (typeof cli.ngrok !== 'undefined') {
    debug('Starting ngrok tunnel');
    const ngrokConfig: NgrokConfig = { addr: port };
    if (typeof cli.ngrok === 'string' && cli.ngrok.length > 0) {
      ngrokConfig.subdomain = cli.ngrok;
    }
    let ngrok;
    try {
      ngrok = require('ngrok');
    } catch (error) {
      throw new Error(
        'ngrok could not be started because the module is not installed. Please install optional dependencies and try again.'
      );
    }
    url = await ngrok.connect(ngrokConfig);
    debug('ngrok tunnel URL: %s', url);
  }

  return url;
}

export function getPort(cli: StartCliFlags): number {
  let port = process.env.PORT || 3000;
  if (typeof cli.port !== 'undefined') {
    port = cli.port;
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
      const envContent = readFileSync(fullEnvPath, 'utf8');
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
  let cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();
  const configFlags = readSpecializedConfig(cwd, flags.config, 'start', {
    username:
      (externalCliOptions && externalCliOptions.accountSid) || undefined,
  }) as StartCliFlags;
  const cli = mergeFlagsAndConfig<StartCliFlags>(configFlags, flags, cliInfo);
  const config = {} as StartCliConfig;
  const baseDir = getBaseDirectory(cli);
  cli.cwd = baseDir;
  const pkgJson = await readPackageJsonContent(cli);

  config.inspect = getInspectInfo(cli);
  config.baseDir = baseDir;
  config.env = await getEnvironment(cli, config.baseDir);
  config.port = getPort(cli);
  config.detailedLogs = cli.detailedLogs;
  config.live = cli.live;
  config.logs = cli.logs;
  config.legacyMode = cli.legacyMode;
  config.appName = 'twilio-run';
  config.assetsFolderName = cli.assetsFolder;
  config.functionsFolderName = cli.functionsFolder;
  config.forkProcess = cli.forkProcess;

  if (typeof config.inspect !== 'undefined') {
    debug('Disabling fork-process in inspect mode.');
    config.forkProcess = false;
  }

  config.pkgJson = pkgJson;

  return config;
}
