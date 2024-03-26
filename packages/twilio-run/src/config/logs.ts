import {
  ClientConfig,
  LogsConfig as ApiLogsConfig,
} from '@twilio-labs/serverless-api';
import path from 'path';
import { Arguments } from 'yargs';
import checkForValidServiceSid from '../checks/check-service-sid';
import { cliInfo } from '../commands/logs';
import { ExternalCliOptions } from '../commands/shared';
import { getFullCommand } from '../commands/utils';
import {
  AllAvailableFlagTypes,
  SharedFlagsWithCredentialNames,
} from '../flags';
import { getFunctionServiceSid } from '../serverless-api/utils';
import { readSpecializedConfig } from './global';
import { getCredentialsFromFlags, readLocalEnvFile } from './utils';
import { mergeFlagsAndConfig } from './utils/mergeFlagsAndConfig';
import { getUserAgentExtensions } from './utils/userAgentExtensions';

export type LogsConfig = ClientConfig &
  ApiLogsConfig & {
    username: string;
    password: string;
    cwd: string;
    properties?: string[];
    outputFormat?: string;
  };

export type ConfigurableLogsCliFlags = Pick<
  AllAvailableFlagTypes,
  | SharedFlagsWithCredentialNames
  | 'environment'
  | 'serviceSid'
  | 'functionSid'
  | 'tail'
  | 'outputFormat'
  | 'logCacheSize'
  | 'production'
>;
export type LogsCliFlags = Arguments<ConfigurableLogsCliFlags>;

export async function getConfigFromFlags(
  flags: LogsCliFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<LogsConfig> {
  let cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();
  flags.cwd = cwd;

  let environment = flags.environment || 'dev';
  flags.environment = environment;

  const configFlags = readSpecializedConfig(cwd, flags.config, 'logs', {
    username:
      flags.username ||
      (externalCliOptions && externalCliOptions.accountSid) ||
      undefined,
    environmentSuffix: environment,
    region: flags.region,
  });

  flags = mergeFlagsAndConfig<LogsCliFlags>(configFlags, flags, cliInfo);
  cwd = flags.cwd || cwd;
  environment = flags.environment || environment;

  if (flags.production) {
    environment = '';
  }

  const { localEnv: envFileVars, envPath } = await readLocalEnvFile(flags);
  const { username, password } = await getCredentialsFromFlags(
    flags,
    envFileVars,
    externalCliOptions
  );

  const command = getFullCommand(flags);

  const potentialServiceSid =
    flags.serviceSid ||
    (await getFunctionServiceSid(
      cwd,
      flags.config,
      'logs',
      flags.username?.startsWith('AC')
        ? flags.username
        : username.startsWith('AC')
        ? username
        : externalCliOptions?.accountSid,
      flags.region
    ));

  const serviceSid = checkForValidServiceSid(command, potentialServiceSid);
  const outputFormat = flags.outputFormat || externalCliOptions?.outputFormat;
  const region = flags.region;
  const edge = flags.edge;

  return {
    cwd,
    username,
    password,
    environment,
    serviceSid,
    outputFormat,
    filterByFunction: flags.functionSid,
    tail: flags.tail,
    region,
    edge,
    logCacheSize: flags.logCacheSize,
    userAgentExtensions: getUserAgentExtensions('logs', externalCliOptions),
  };
}
