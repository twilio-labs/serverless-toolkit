import { ConfigurationFile } from '../../../types/config';

let __config = {};

export function __setTestConfig(config: Partial<ConfigurationFile>) {
  __config = config;
}

export function getConfig(
  baseDir: string,
  configPath?: string
): Partial<ConfigurationFile> {
  return __config;
}
