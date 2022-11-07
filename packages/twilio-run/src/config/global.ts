import {
  CommandConfigurationNames,
  CommandConfigurations,
} from '../types/config';
import { getConfig } from './utils/configLoader';

export type SpecializedConfigOptions = {
  username: string;
  environmentSuffix: string;
  region: string;
};

export const EXCLUDED_FLAGS = [
  'username',
  'password',
  'config',
  'key',
  'value',
  'show-values',
];

export function readSpecializedConfig<T extends CommandConfigurationNames>(
  baseDir: string,
  configFileName: string,
  commandConfigName: T,
  opts?: Partial<SpecializedConfigOptions>
): Required<CommandConfigurations>[T] {
  const config = getConfig(baseDir, configFileName);
  let result: Required<CommandConfigurations>[T] = {};

  const {
    projects: projectsConfig,
    environments: environmentsConfig,
    commands: commandConfig,
    ...baseConfig
  } = config;

  // take base level config logic
  result = baseConfig;

  // override if command specific config exists
  if (commandConfig?.hasOwnProperty(commandConfigName)) {
    result = {
      ...result,
      ...(commandConfig as any)[commandConfigName],
    };
  }

  const environmentValue =
    typeof opts?.environmentSuffix === 'string' &&
    opts.environmentSuffix.length === 0
      ? '*'
      : opts?.environmentSuffix;

  // override if environment config exists
  if (
    environmentValue &&
    environmentsConfig &&
    environmentsConfig[environmentValue]
  ) {
    result = {
      ...result,
      ...environmentsConfig[environmentValue],
    };
  }

  // override if project specific config exists
  if (
    opts &&
    opts.username &&
    projectsConfig &&
    (projectsConfig[opts.username] ||
      projectsConfig[`${opts.username}:${opts.region}`])
  ) {
    if (projectsConfig[`${opts.username}:${opts.region}`]) {
      result = {
        ...result,
        ...projectsConfig[`${opts.username}:${opts.region}`],
      };
    } else if (opts.region === 'us1' || opts.region === undefined) {
      result = {
        ...result,
        ...projectsConfig[opts.username],
      };
    }
  }

  EXCLUDED_FLAGS.forEach((key) => {
    delete (result as any)[key];
  });

  return result;
}
