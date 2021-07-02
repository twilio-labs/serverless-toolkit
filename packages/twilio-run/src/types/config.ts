import { Merge } from 'type-fest';
import { ConfigurableNewCliFlags } from '../commands/new';
import { ConfigurableDeployCliFlags } from '../config/deploy';
import { ConfigurableEnvGetCliFlags } from '../config/env/env-get';
import { ConfigurableListCliFlags } from '../config/list';
import { ConfigurableLogsCliFlags } from '../config/logs';
import { ConfigurablePromoteCliFlags } from '../config/promote';
import { ConfigurableStartCliFlags } from '../config/start';
import { AllAvailableFlagTypes } from '../flags';

export type AllConfigurationValues = AllAvailableFlagTypes;

export type EnvironmentConfigurations = {
  [environment: string]: Partial<AllConfigurationValues>;
};

export type ProjectConfigurations = {
  [accountSid: string]: Partial<AllConfigurationValues>;
};

export type CommandConfigurations = {
  deploy?: Partial<ConfigurableDeployCliFlags>;
  list?: Partial<ConfigurableListCliFlags>;
  start?: Partial<ConfigurableStartCliFlags>;
  promote?: Partial<ConfigurablePromoteCliFlags>;
  logs?: Partial<ConfigurableLogsCliFlags>;
  new?: Partial<ConfigurableNewCliFlags>;
  env?: Partial<ConfigurableEnvGetCliFlags>;
};

export type ConfigurationFile = Merge<
  AllConfigurationValues,
  {
    commands?: CommandConfigurations;
    environments?: EnvironmentConfigurations;
    projects?: ProjectConfigurations;
  }
>;

export type CommandConfigurationNames = keyof CommandConfigurations;
