import { Options } from 'yargs';
import { LoggingLevel, LoggingLevelNames } from './utils/logger';

export const baseCliOptions = {
  'log-level': {
    type: 'string',
    default: 'info',
    alias: 'l',
    describe: 'Level of logging messages.',
    choices: Object.keys(LoggingLevel),
  } as Options,
  config: {
    alias: 'c',
    type: 'string',
    describe:
      'Location of the config file. Absolute path or relative to current working directory (cwd)',
  } as Options,
  cwd: {
    type: 'string',
    describe:
      'Sets the directory of your existing Serverless project. Defaults to current directory',
  } as Options,
  env: {
    type: 'string',
    describe:
      'Path to .env file for environment variables that should be installed',
  } as Options,
};

export const BASE_CLI_FLAG_NAMES = Object.keys(baseCliOptions) as Array<
  keyof typeof baseCliOptions
>;

export const sharedApiRelatedCliOptions = {
  region: {
    type: 'string',
    hidden: true,
    describe: 'Twilio API Region',
  } as Options,
  edge: {
    type: 'string',
    hidden: true,
    describe: 'Twilio API Region',
  } as Options,
  username: {
    type: 'string',
    alias: 'u',
    describe:
      'A specific API key or account SID to be used for deployment. Uses fields in .env otherwise',
  } as Options,
  password: {
    type: 'string',
    describe:
      'A specific API secret or auth token for deployment. Uses fields from .env otherwise',
  } as Options,
  'load-system-env': {
    default: false,
    type: 'boolean',
    describe:
      'Uses system environment variables as fallback for variables specified in your .env file. Needs to be used with --env explicitly specified.',
  } as Options,
};

export const BASE_API_FLAG_NAMES = Object.keys(
  sharedApiRelatedCliOptions
) as Array<keyof typeof sharedApiRelatedCliOptions>;

export const ALL_FLAGS = {
  ...baseCliOptions,
  ...sharedApiRelatedCliOptions,
  'service-sid': {
    type: 'string',
    describe: 'SID of the Twilio Serverless Service to deploy to',
  } as Options,
  'build-sid': {
    type: 'string',
    alias: 'from-build',
    describe: 'An existing Build SID to deploy to the new environment',
  } as Options,
  'source-environment': {
    type: 'string',
    alias: 'from',
    describe:
      'SID or suffix of an existing environment you want to deploy from.',
  } as Options,
  environment: {
    type: 'string',
    alias: 'to',
    describe:
      'The environment name (domain suffix) you want to use for your deployment. Alternatively you can specify an environment SID starting with ZE.',
    default: 'dev',
  } as Options,
  production: {
    type: 'boolean',
    describe:
      'Promote build to the production environment (no domain suffix). Overrides environment flag',
    default: false,
  } as Options,
  'create-environment': {
    type: 'boolean',
    describe: "Creates environment if it couldn't find it.",
    default: false,
  } as Options,
  force: {
    type: 'boolean',
    describe: 'Will run deployment in force mode. Can be dangerous.',
    default: false,
  } as Options,
  'service-name': {
    type: 'string',
    alias: 'n',
    describe:
      'Overrides the name of the Serverless project. Default: the name field in your package.json',
  } as Options,
  functions: {
    type: 'boolean',
    describe: 'Upload functions. Can be turned off with --no-functions',
    default: true,
  } as Options,
  assets: {
    type: 'boolean',
    describe: 'Upload assets. Can be turned off with --no-assets',
    default: true,
  } as Options,
  'assets-folder': {
    type: 'string',
    describe: 'Specific folder name to be used for static assets',
  } as Options,
  'functions-folder': {
    type: 'string',
    describe: 'Specific folder name to be used for static functions',
  } as Options,
  'override-existing-project': {
    type: 'boolean',
    describe:
      'Deploys Serverless project to existing service if a naming conflict has been found.',
    default: false,
  } as Options,
  properties: {
    type: 'string',
    describe:
      'Specify the output properties you want to see. Works best on single types',
    hidden: true,
  } as Options,
  'extended-output': {
    type: 'boolean',
    describe: 'Show an extended set of properties on the output',
    default: false,
  } as Options,
  'function-sid': {
    type: 'string',
    describe: 'Specific Function SID to retrieve logs for',
  } as Options,
  tail: {
    type: 'boolean',
    describe: 'Continuously stream the logs',
  } as Options,
  'output-format': {
    type: 'string',
    alias: 'o',
    default: '',
    describe: 'Output the results in a different format',
    choices: ['', 'json'],
  } as Options,
  'log-cache-size': {
    type: 'number',
    hidden: true,
    describe:
      'Tailing the log endpoint will cache previously seen entries to avoid duplicates. The cache is topped at a maximum of 1000 by default. This option can change that.',
  } as Options,
  template: {
    type: 'string',
    description: 'Name of template to be used',
  } as Options,
  'load-local-env': {
    alias: 'f',
    default: false,
    type: 'boolean',
    describe: 'Includes the local environment variables',
  } as Options,
  port: {
    alias: 'p',
    type: 'string',
    describe: 'Override default port of 3000',
    default: '3000',
    requiresArg: true,
  } as Options,
  ngrok: {
    type: 'string',
    describe:
      'Uses ngrok to create a public url. Pass a string to set the subdomain (requires a paid-for ngrok account).',
  } as Options,
  logs: {
    type: 'boolean',
    default: true,
    describe: 'Toggles request logging',
  } as Options,
  'detailed-logs': {
    type: 'boolean',
    default: false,
    describe:
      'Toggles detailed request logging by showing request body and query params',
  } as Options,
  live: {
    type: 'boolean',
    default: true,
    describe: 'Always serve from the current functions (no caching)',
  } as Options,
  inspect: {
    type: 'string',
    describe: 'Enables Node.js debugging protocol',
  } as Options,
  'inspect-brk': {
    type: 'string',
    describe:
      'Enables Node.js debugging protocol, stops execution until debugger is attached',
  } as Options,
  'legacy-mode': {
    type: 'boolean',
    describe:
      'Enables legacy mode, it will prefix your asset paths with /assets',
  } as Options,
  'fork-process': {
    type: 'boolean',
    describe:
      'Disable forking function processes to emulate production environment',
    default: true,
  } as Options,
  runtime: {
    type: 'string',
    describe: 'The version of Node.js to deploy the build to. (node22)',
  } as Options,
  key: {
    type: 'string',
    describe: 'Name of the environment variable',
    demandOption: true,
  } as Options,
  value: {
    type: 'string',
    describe: 'Name of the environment variable',
    demandOption: true,
  } as Options,
  'show-values': {
    type: 'boolean',
    describe: 'Show the values of your environment variables',
    default: false,
  } as Options,
};

export type AvailableFlags = typeof ALL_FLAGS;
export type FlagNames = keyof AvailableFlags;

export function getRelevantFlags(flags: FlagNames[]): {
  [flagName: string]: Options;
} {
  return flags.reduce((current: { [flagName: string]: Options }, flagName) => {
    return { ...current, [flagName]: { ...ALL_FLAGS[flagName] } };
  }, {});
}

export type BaseFlags = {
  logLevel: LoggingLevelNames;
};
export type BaseFlagNames = keyof BaseFlags;

export type SharedFlags = BaseFlags & {
  config: string;
  cwd?: string;
  env?: string;
};
export type SharedFlagNames = keyof SharedFlags;

export type SharedFlagsWithCredentials = SharedFlags & {
  username?: string;
  password?: string;
  region?: string;
  edge?: string;
  loadSystemEnv: boolean;
};
export type SharedFlagsWithCredentialNames = keyof SharedFlagsWithCredentials;

export type AllAvailableFlagTypes = SharedFlagsWithCredentials & {
  serviceSid?: string;
  buildSid?: string;
  sourceEnvironment?: string;
  environment: string;
  production: boolean;
  createEnvironment: boolean;
  force: boolean;
  serviceName?: string;
  functions: boolean;
  assets: boolean;
  assetsFolder?: string;
  functionsFolder?: string;
  overrideExistingProject: boolean;
  properties?: string;
  extendedOutput: boolean;
  functionSid?: string;
  tail: boolean;
  outputFormat?: 'json';
  logCacheSize?: number;
  template: string;
  loadLocalEnv: boolean;
  port?: number;
  ngrok?: string | boolean;
  logs: boolean;
  detailedLogs: boolean;
  live: boolean;
  inspect?: string;
  inspectBrk?: string;
  legacyMode: boolean;
  forkProcess: boolean;
  runtime?: string;
  key: string;
  value?: string;
  showValues: boolean;
};
