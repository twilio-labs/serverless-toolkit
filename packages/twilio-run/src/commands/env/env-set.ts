import { Argv } from 'yargs';
import {
  BASE_API_FLAG_NAMES,
  BASE_CLI_FLAG_NAMES,
  getRelevantFlags,
} from '../../flags';
import { ExternalCliOptions } from '../shared';
import { CliInfo } from '../types';

export async function handler(
  flagsInput: {},
  externalCliOptions?: ExternalCliOptions
) {}

export const cliInfo: CliInfo = {
  options: {
    ...getRelevantFlags([
      ...BASE_CLI_FLAG_NAMES,
      ...BASE_API_FLAG_NAMES,
      'service-sid',
      'environment',
      'key',
      'value',
      'production',
    ]),
  },
};

function optionBuilder(yargs: Argv<any>): Argv<any> {
  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['set'];
export const describe =
  'Sets an environment variable with a given key and value';
export const builder = optionBuilder;
