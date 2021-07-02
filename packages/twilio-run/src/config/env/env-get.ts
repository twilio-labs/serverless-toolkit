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
import { readSpecializedConfig } from './../global';
import {
  getCredentialsFromFlags,
  getServiceNameFromFlags,
  readLocalEnvFile,
} from './../utils';
import { mergeFlagsAndConfig } from './../utils/mergeFlagsAndConfig';

export type EnvGetConfig = ApiEnvironmentConfig & {
  username: string;
  password: string;
  cwd: string;
};

export type ConfigurableEnvGetCliFlags = Pick<
  AllAvailableFlagTypes,
  SharedFlagsWithCredentialNames | 'serviceSid' | 'environment' | 'production'
>;
export type EnvGetFlags = Arguments<
  ConfigurableEnvGetCliFlags & {
    key: string;
  }
>;

export async function getConfigFromFlags(
  flags: EnvGetFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<EnvGetConfig> {
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
  });

  flags = mergeFlagsAndConfig<EnvGetFlags>(configFlags, flags, cliInfo);
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
        : externalCliOptions?.accountSid
    ));

  let serviceName = await getServiceNameFromFlags(flags);

  if (!flags.key) {
    throw new Error(
      'Missing --key argument. Please provide a key for your environment variable.'
    );
  }

  const keys = [flags.key];

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
    getValues: true,
  };
}
