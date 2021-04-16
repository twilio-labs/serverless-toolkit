import {
  CommandConfigurationNames,
  CommandConfigurations,
} from '../types/config';
import { getConfig } from './utils/configLoader';

export type SpecializedConfigOptions = {
  accountSid: string;
  environmentSuffix: string;
};

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
    opts.accountSid &&
    projectsConfig &&
    projectsConfig[opts.accountSid]
  ) {
    result = {
      ...result,
      ...projectsConfig[opts.accountSid],
    };
  }

  return result;
}
