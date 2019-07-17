import Conf from 'conf';
import kebabCase from 'lodash.kebabcase';
import { ActivateCliFlags } from '../commands/activate';
import { DeployCliFlags } from '../commands/deploy';
import { ListCliFlags } from '../commands/list';
import { CliInfo } from '../commands/types';
import { StartCliFlags } from './start';

const DEFAULT_CONFIG_NAME = '.twilio-functions';

type CommandConfigurations = {
  deployConfig: Partial<DeployCliFlags>;
  listConfig: Partial<ListCliFlags>;
  startConfig: Partial<StartCliFlags & { serviceSid: string }>;
  activateConfig: Partial<ActivateCliFlags>;
};

type ProjectConfigurations = Partial<CommandConfigurations> & {
  serviceSid?: string;
  latestBuild?: string;
  environments?: {
    [environmentSuffix: string]: Partial<CommandConfigurations>;
  };
};

type ConfigurationFile = Partial<CommandConfigurations> &
  ProjectConfigurations & {
    projects: {
      [id: string]: ProjectConfigurations;
    };
  };

let config: undefined | Conf<any>;

export function getConfig(
  baseDir: string,
  configName: string = DEFAULT_CONFIG_NAME
) {
  if (config) {
    return config;
  }
  config = new Conf<any>({
    cwd: baseDir,
    fileExtension: '',
    configName: configName,
    defaults: {
      projects: {},
    },
  });
  return config;
}

export type SpecializedConfigOptions = {
  projectId: string;
  environmentSuffix: string;
};

export function readSpecializedConfig<T extends keyof CommandConfigurations>(
  baseDir: string,
  configFileName: string,
  commandConfigName: T,
  opts?: Partial<SpecializedConfigOptions>
): CommandConfigurations[T] {
  const config = getConfig(baseDir, configFileName);
  let result: CommandConfigurations[T] = {};

  if (config.has('serviceSid')) {
    result.serviceSid = config.get('serviceSid');
  }

  if (config.has(commandConfigName)) {
    const partial = config.get(commandConfigName) as CommandConfigurations[T];
    result = {
      ...result,
      ...partial,
    };
  }

  if (opts) {
    if (opts.projectId) {
      const projectConfigPath = `projects.${opts.projectId}`;
      if (config.has(projectConfigPath)) {
        const partial = config.get(projectConfigPath);
        delete partial.environments;
        delete partial.listConfig;
        delete partial.startConfig;
        delete partial.deployConfig;
        delete partial.activateConfig;
        result = { ...result, ...partial };
      }

      const commandConfigPath = `projects.${opts.projectId}.${commandConfigName}`;
      if (config.has(commandConfigPath)) {
        const partial = config.get(commandConfigPath);
        result = { ...result, ...partial };
      }
    }

    if (opts.environmentSuffix) {
      const environmentConfigPath = `environments.${opts.environmentSuffix}.${commandConfigName}`;
      if (config.has(environmentConfigPath)) {
        const partial = config.get(environmentConfigPath);
        result = { ...result, ...partial };
      }
    }

    if (opts.projectId && opts.environmentSuffix) {
      const configPath = `projects.${opts.projectId}.environments.${opts.environmentSuffix}.${commandConfigName}`;
      if (config.has(configPath)) {
        const partial = config.get(configPath);
        result = { ...result, ...partial };
      }
    }
  }

  return result;
}

export function mergeFlagsAndConfig<T extends { [key: string]: any }>(
  config: T,
  flags: T,
  cliInfo: CliInfo
): T {
  return Object.keys(config).reduce(
    (result: T, key: string) => {
      let value = flags[key];
      if (
        value === (cliInfo.options[kebabCase(key)] || {}).default &&
        typeof config[key] !== 'undefined'
      ) {
        value = config[key];
      }
      return { ...result, [key]: value };
    },
    { ...config }
  );
}
