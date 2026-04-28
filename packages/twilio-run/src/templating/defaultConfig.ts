import camelCase from 'lodash.camelcase';
import os from 'os';
import path from 'path';
import { Options } from 'yargs';
import { EXCLUDED_FLAGS } from '../config/global';
import { ALL_FLAGS } from '../flags';
import { fileExists, writeFile } from '../utils/fs';
import { getDebugFunction } from '../utils/logger';

const debug = getDebugFunction('twilio-run:templating:defaultConfig');

const DEFAULT_RUNTIME = 'node22';

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
  if (flag === 'runtime' && typeof config.default !== 'string') {
    // special case for runtime with a hard coded default for a better Node.js transition
    return `\t"${camelCase(flag)}": "${DEFAULT_RUNTIME}" \t/* ${
      config.describe
    } */,`;
  }

  return `\t// "${camelCase(flag)}": ${renderDefault(config)} \t/* ${
    config.describe
  } */,`;
}

export function templateDefaultConfigFile() {
  const lines = Object.entries(ALL_FLAGS)
    .filter(([name]) => !EXCLUDED_FLAGS.includes(name))
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

  const configFileExists = await fileExists(fullConfigFilePath, true);

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
