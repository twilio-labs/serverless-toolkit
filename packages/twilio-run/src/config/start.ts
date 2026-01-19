import { EnvironmentVariables } from '@twilio-labs/serverless-api';
import dotenv from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import os from 'os';
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
import type { Listener } from '@ngrok/ngrok';

const debug = getDebugFunction('twilio-run:cli:config');

// Helper function to read ngrok authtoken from config file
export function getNgrokAuthToken(): string | undefined {
  const possiblePaths = [
    path.join(os.homedir(), '.ngrok2', 'ngrok.yml'),
    path.join(
      os.homedir(),
      'Library',
      'Application Support',
      'ngrok',
      'ngrok.yml'
    ),
    path.join(os.homedir(), 'AppData', 'Local', 'ngrok', 'ngrok.yml'),
  ];

  for (const configPath of possiblePaths) {
    try {
      if (existsSync(configPath)) {
        const content = readFileSync(configPath, 'utf8');
        const match = content.match(/authtoken:\s*([^\s#]+)/);
        if (match && match[1]) {
          return match[1];
        }
      }
    } catch (error) {
      // Ignore errors and try next path
    }
  }

  return undefined;
}

// Store ngrok listener for cleanup on exit
// Note: This is a module-level singleton designed for CLI usage where the server
// runs once and exits. In test environments or programmatic usage with multiple
// server restarts, call close() on the listener before creating a new tunnel.
let ngrokListener: Listener | null = null;
let ngrokCleanupRegistered = false;

// Store handler references for cleanup
let sigintHandler: (() => Promise<void>) | null = null;
let sigtermHandler: (() => Promise<void>) | null = null;

const handleShutdown = async () => {
  if (ngrokListener && typeof ngrokListener.close === 'function') {
    debug('Closing ngrok tunnel...');
    try {
      await ngrokListener.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
  }
  process.exit(0);
};

// Register cleanup handlers for ngrok tunnel
function registerNgrokCleanup(listener: Listener): void {
  ngrokListener = listener;

  // Only register handlers once
  if (!ngrokCleanupRegistered) {
    sigintHandler = handleShutdown;
    sigtermHandler = handleShutdown;

    process.once('SIGINT', sigintHandler);
    process.once('SIGTERM', sigtermHandler);
    ngrokCleanupRegistered = true;
  }
}

// For testing purposes only: reset module state
export function __resetNgrokState(): void {
  // Remove signal handlers if they exist
  if (sigintHandler) {
    process.removeListener('SIGINT', sigintHandler);
    sigintHandler = null;
  }
  if (sigtermHandler) {
    process.removeListener('SIGTERM', sigtermHandler);
    sigtermHandler = null;
  }

  // Reset module state
  ngrokListener = null;
  ngrokCleanupRegistered = false;
}

type NgrokConfig = {
  addr: string | number;
  domain?: string;
  authtoken?: string;
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

    // Convert subdomain to domain format for backward compatibility
    if (typeof cli.ngrok === 'string' && cli.ngrok.length > 0) {
      // Check if it's already a full ngrok domain (ends with official ngrok TLDs)
      const isNgrokDomain =
        cli.ngrok.endsWith('.ngrok.io') ||
        cli.ngrok.endsWith('.ngrok.dev') ||
        cli.ngrok.endsWith('.ngrok-free.app');

      ngrokConfig.domain = isNgrokDomain
        ? cli.ngrok // Already a full ngrok domain
        : `${cli.ngrok}.ngrok.io`; // Just subdomain, add .ngrok.io
    }

    // Read authtoken from ngrok config file
    const authtoken = getNgrokAuthToken();
    if (authtoken) {
      ngrokConfig.authtoken = authtoken;
      debug('Found ngrok authtoken in config file');
    }

    let ngrok;
    try {
      ngrok = require('@ngrok/ngrok');
    } catch (error) {
      throw new Error(
        'ngrok could not be started because the module is not installed. Please install optional dependencies and try again.'
      );
    }

    try {
      // Close any existing tunnel before creating a new one
      if (ngrokListener) {
        debug('Closing existing ngrok tunnel before creating new one...');
        try {
          await ngrokListener.close();
        } catch (error) {
          debug('Error closing existing tunnel: %s', error);
          // Continue anyway to create new tunnel
        }
        ngrokListener = null;
      }

      // Use forward() instead of connect()
      const listener = await ngrok.forward(ngrokConfig);

      // Register cleanup handlers and store listener
      registerNgrokCleanup(listener);

      // Get URL from listener
      const tunnelUrl = listener.url();
      if (!tunnelUrl) {
        throw new Error('ngrok tunnel was created but no URL was returned');
      }

      url = tunnelUrl;
      debug('ngrok tunnel URL: %s', url);
    } catch (error: any) {
      // Handle known ngrok execution failures:
      // - error.code === 'ENOEXEC': standard "exec format error" (errno 8)
      // - errno === -88: observed macOS-specific ngrok spawn error (not standard ENOEXEC)
      if (
        error &&
        (error.code === 'ENOEXEC' ||
          (typeof error.errno === 'number' && error.errno === -88))
      ) {
        const platform = process.platform;
        const arch = process.arch;
        throw new Error(
          `ngrok failed to start.\n` +
            `System: ${platform}-${arch}\n\n` +
            `This usually indicates a problem executing the ngrok binary, ` +
            `such as an incompatible architecture or missing execute permissions.\n` +
            `Verify that your environment is supported by @ngrok/ngrok ` +
            `and that the ngrok binary is executable.\n\n` +
            `Original error: ${error?.message || 'Unknown error'}`
        );
      }

      // Re-throw other errors with context
      throw new Error(
        `ngrok failed to start: ${error?.message || 'Unknown error'}\n` +
          `Check your ngrok configuration and network connectivity.\n` +
          `For more help, visit: https://ngrok.com/docs`
      );
    }
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
