import { GetEnvironmentVariablesConfig as ApiEnvironmentConfig } from '@twilio-labs/serverless-api';
import path from 'path';
import { Arguments } from 'yargs';
import { cliInfo } from '../../commands/list';
import { ExternalCliOptions } from '../../commands/shared';
import {
  AllAvailableFlagTypes,
  SharedFlagsWithCredentialNames,
} from '../../flags';
import { getFunctionServiceSid } from '../../serverless-api/utils';
import { readSpecializedConfig } from '../global';
import {
  getCredentialsFromFlags,
  getServiceNameFromFlags,
  readLocalEnvFile,
} from '../utils';
import { mergeFlagsAndConfig } from '../utils/mergeFlagsAndConfig';

export type EnvListConfig = ApiEnvironmentConfig & {
  username: string;
  password: string;
  cwd: string;
};

export type ConfigurableEnvGetCliFlags = Pick<
  AllAvailableFlagTypes,
  | SharedFlagsWithCredentialNames
  | 'serviceSid'
  | 'environment'
  | 'production'
  | 'outputFormat'
>;
export type EnvListFlags = Arguments<
  ConfigurableEnvGetCliFlags & {
    showValues: boolean;
  }
>;

export async function getConfigFromFlags(
  flags: EnvListFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<EnvListConfig> {
  let cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();
  flags.cwd = cwd;

  if (flags.production) {
    flags.environment = '';
  }

  const configFlags = readSpecializedConfig(cwd, flags.config, 'env', {
    username:
      flags.username ||
      (externalCliOptions && externalCliOptions.accountSid) ||
      undefined,
    environmentSuffix: flags.environment,
    region: flags.region,
  });

  flags = mergeFlagsAndConfig<EnvListFlags>(configFlags, flags, cliInfo);
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
      'env',
      flags.username?.startsWith('AC')
        ? flags.username
        : username.startsWith('AC')
        ? username
        : externalCliOptions?.accountSid,
      flags.region
    ));

  let serviceName = await getServiceNameFromFlags(flags);

  const keys: string[] = [];

  return {
    cwd,
    username,
    password,
    serviceSid,
    serviceName,
    environment: flags.environment,
    region: flags.region,
    edge: flags.edge,
    keys,
    getValues: flags.showValues,
  };
}
