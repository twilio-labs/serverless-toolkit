import { Options } from 'yargs';

export type CliInfo = {
  argsDefaults?: {
    [key: string]: string | boolean;
  };
  options: {
    [key: string]: Options;
  };
};
