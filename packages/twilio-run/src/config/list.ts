import {
  ListConfig as ApiListConfig,
  ListOptions,
} from '@twilio-labs/serverless-api';
import path from 'path';
import { Arguments } from 'yargs';
import { cliInfo } from '../commands/list';
import { ExternalCliOptions } from '../commands/shared';
import {
  AllAvailableFlagTypes,
  SharedFlagsWithCredentialNames,
} from '../flags';
import { getFunctionServiceSid } from '../serverless-api/utils';
import { readSpecializedConfig } from './global';
import {
  getCredentialsFromFlags,
  getServiceNameFromFlags,
  readLocalEnvFile,
} from './utils';
import { mergeFlagsAndConfig } from './utils/mergeFlagsAndConfig';
import { getUserAgentExtensions } from './utils/userAgentExtensions';

export type ListConfig = ApiListConfig & {
  username: string;
  password: string;
  cwd: string;
  properties?: string[];
  extendedOutput: boolean;
};

export type ConfigurableListCliFlags = Pick<
  AllAvailableFlagTypes,
  | SharedFlagsWithCredentialNames
  | 'serviceName'
  | 'properties'
  | 'extendedOutput'
  | 'environment'
  | 'serviceSid'
>;
export type ListCliFlags = Arguments<
  ConfigurableListCliFlags & {
    types: string;
    projectName?: string;
  }
>;

function trim(str: string) {
  return str.trim();
}

export async function getConfigFromFlags(
  flags: ListCliFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<ListConfig> {
  let cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();
  flags.cwd = cwd;

  const configFlags = readSpecializedConfig(cwd, flags.config, 'list', {
    username:
      flags.username ||
      (externalCliOptions && externalCliOptions.accountSid) ||
      undefined,
    environmentSuffix: flags.environment,
  });

  flags = mergeFlagsAndConfig<ListCliFlags>(configFlags, flags, cliInfo);
  cwd = flags.cwd || cwd;

  const { localEnv: envFileVars, envPath } = await readLocalEnvFile(flags);
  const { username, password } = await getCredentialsFromFlags(
    flags,
    envFileVars,
    externalCliOptions
  );

  const serviceSid =
    flags.serviceSid ||
    (await getFunctionServiceSid(
      cwd,
      flags.config,
      'list',
      flags.username?.startsWith('AC')
        ? flags.username
        : username.startsWith('AC')
        ? username
        : externalCliOptions?.accountSid
    ));

  let serviceName = await getServiceNameFromFlags(flags);

  const types = flags.types.split(',').map(trim) as ListOptions[];
  const region = flags.region;
  const edge = flags.edge;

  return {
    cwd,
    username,
    password,
    serviceSid,
    serviceName,
    environment: flags.environment,
    properties: flags.properties
      ? flags.properties.split(',').map((x) => x.trim())
      : undefined,
    extendedOutput: flags.extendedOutput,
    types,
    region,
    edge,
    userAgentExtensions: getUserAgentExtensions('list', externalCliOptions),
  };
}
