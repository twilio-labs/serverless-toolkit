import camelCase from 'lodash.camelcase';
import os from 'os';
import path from 'path';
import { Options } from 'yargs';
import { ALL_FLAGS } from '../flags';
import { fileExists, writeFile } from '../utils/fs';
import { getDebugFunction } from '../utils/logger';

const debug = getDebugFunction('twilio-run:templating:defaultConfig');

function renderDefault(config: Options): string {
  if (config.type === 'boolean') {
    if (typeof config.default === 'boolean') {
      return config.default.toString();
    }
    return 'false';
  } else if (config.type === 'string') {
    if (typeof config.default === 'string') {
      return `"${config.default}"`;
    }
    return 'null';
  }

  return 'null';
}

function templateFlagAsConfig([flag, config]: [string, Options]) {
  return `\t// "${camelCase(flag)}": ${renderDefault(config)} \t/* ${
    config.describe
  } */,`;
}

export function templateDefaultConfigFile() {
  const lines = Object.entries(ALL_FLAGS)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(templateFlagAsConfig)
    .join(os.EOL);
  return [
    '{',
    `\t"commands": {},`,
    `\t"environments": {},`,
    `\t"projects": {},`,
    lines,
    '}',
  ].join(os.EOL);
}

export async function writeDefaultConfigFile(
  baseDir: string,
  overrideExisting = false,
  fileName: string = '.twilioserverlessrc'
): Promise<boolean> {
  const fullConfigFilePath = path.resolve(baseDir, fileName);

  const configFileExists = await fileExists(fullConfigFilePath);

  if (configFileExists && !overrideExisting) {
    return false;
  }

  const content = templateDefaultConfigFile();
  try {
    await writeFile(fullConfigFilePath, content, 'utf8');
    return true;
  } catch (err) {
    debug('Failed to write default config file. %O', err);
    return false;
  }
}
