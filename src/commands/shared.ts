import { Options } from 'yargs';

export type SharedFlags = {
  config: string;
  cwd?: string;
};

export const sharedCliOptions: { [key: string]: Options } = {
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
