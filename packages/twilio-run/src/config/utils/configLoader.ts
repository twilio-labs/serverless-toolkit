import { cosmiconfigSync } from 'cosmiconfig';
import { ConfigurationFile } from '../../types/config';
import { json5Loader } from '../../utils/json5';
import { getDebugFunction } from '../../utils/logger';

const debug = getDebugFunction('twilio-run:config:configLoader');

const DEFAULT_MODULE_NAME = 'twilioserverless';
const configExplorer = cosmiconfigSync(DEFAULT_MODULE_NAME, {
  loaders: {
    '.json5': json5Loader,
    '.json': json5Loader,
    noExt: json5Loader,
  },
});

let config: undefined | Partial<ConfigurationFile>;

export function getConfig(baseDir: string, configPath?: string) {
  debug('Load config');
  if (config) {
    debug('Config cached in memory');
    return config;
  }

  const result = configPath
    ? configExplorer.load(configPath)
    : configExplorer.search(baseDir);

  if (!result) {
    debug('Could not find config. Defaulting to {}');
    config = {};
  } else {
    debug('Config found at %s', result.filepath);
    config = result.config as ConfigurationFile;
  }

  return config;
}
