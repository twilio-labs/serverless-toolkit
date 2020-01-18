import { Options } from 'yargs';
import { LoggingLevel, LoggingLevelNames } from '../utils/logger';

export type BaseFlags = {
  logLevel: LoggingLevelNames;
};

export type SharedFlags = BaseFlags & {
  config: string;
  cwd?: string;
};

export type SharedFlagsWithCredentials = SharedFlags & {
  accountSid?: string;
  authToken?: string;
  env?: string;
};

export type ExternalCliOptions = {
  username: string;
  password: string;
  accountSid?: string;
  profile?: string;
  project?: string;
  logLevel?: string;
  outputFormat?: string;
};

export const baseCliOptions: { [key: string]: Options } = {
  logLevel: {
    type: 'string',
    default: 'info',
    alias: 'l',
    describe: 'Level of logging messages.',
    choices: Object.keys(LoggingLevel),
  },
};

export const sharedCliOptions: { [key: string]: Options } = {
  ...baseCliOptions,
  config: {
    alias: 'c',
    type: 'string',
    default: '.twilio-functions',
    describe:
      'Location of the config file. Absolute path or relative to current working directory (cwd)',
  },
  cwd: {
    type: 'string',
    describe:
      'Sets the directory of your existing Serverless project. Defaults to current directory',
  },
};
