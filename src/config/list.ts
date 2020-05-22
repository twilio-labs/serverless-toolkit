import {
  ListConfig as ApiListConfig,
  ListOptions,
} from '@twilio-labs/serverless-api';
import path from 'path';
import { Arguments } from 'yargs';
import { cliInfo } from '../commands/list';
import {
  ExternalCliOptions,
  SharedFlagsWithCredentials,
} from '../commands/shared';
import { getFunctionServiceSid } from '../serverless-api/utils';
import { readSpecializedConfig } from './global';
import { getCredentialsFromFlags, getServiceNameFromFlags } from './utils';
import { mergeFlagsAndConfig } from './utils/mergeFlagsAndConfig';

export type ListConfig = ApiListConfig & {
  cwd: string;
  properties?: string[];
  extendedOutput: boolean;
};

export type ListCliFlags = Arguments<
  SharedFlagsWithCredentials & {
    types: string;
    projectName?: string;
    serviceName?: string;
    properties?: string;
    extendedOutput: boolean;
    cwd?: string;
    environment?: string;
    serviceSid?: string;
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

  const configFlags = readSpecializedConfig(cwd, flags.config, 'listConfig', {
    projectId:
      flags.accountSid ||
      (externalCliOptions && externalCliOptions.accountSid) ||
      undefined,
    environmentSuffix: flags.environment,
  });

  flags = mergeFlagsAndConfig(configFlags, flags, cliInfo);
  cwd = flags.cwd || cwd;

  const { accountSid, authToken } = await getCredentialsFromFlags(
    flags,
    externalCliOptions
  );

  const serviceSid =
    flags.serviceSid ||
    (await getFunctionServiceSid(cwd, flags.config, 'listConfig'));

  let serviceName = await getServiceNameFromFlags(flags);

  const types = flags.types.split(',').map(trim) as ListOptions[];
  const region = flags.region;
  const edge = flags.edge;

  return {
    cwd,
    accountSid,
    authToken,
    serviceSid,
    serviceName,
    environment: flags.environment,
    properties: flags.properties
      ? flags.properties.split(',').map(x => x.trim())
      : undefined,
    extendedOutput: flags.extendedOutput,
    types,
    region,
    edge,
  };
}
