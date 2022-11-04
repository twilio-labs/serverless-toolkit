import { ActivateConfig as ApiActivateConfig } from '@twilio-labs/serverless-api';
import path from 'path';
import { Arguments } from 'yargs';
import checkForValidServiceSid from '../checks/check-service-sid';
import { cliInfo } from '../commands/promote';
import { ExternalCliOptions } from '../commands/shared';
import { getFullCommand } from '../commands/utils';
import {
  AllAvailableFlagTypes,
  SharedFlagsWithCredentialNames,
} from '../flags';
import { getFunctionServiceSid } from '../serverless-api/utils';
import { readSpecializedConfig } from './global';
import {
  filterEnvVariablesForDeploy,
  getCredentialsFromFlags,
  readLocalEnvFile,
} from './utils';
import { mergeFlagsAndConfig } from './utils/mergeFlagsAndConfig';
import { getUserAgentExtensions } from './utils/userAgentExtensions';

export type PromoteConfig = ApiActivateConfig & {
  cwd: string;
  username: string;
  password: string;
  outputFormat?: string;
};

export type ConfigurablePromoteCliFlags = Pick<
  AllAvailableFlagTypes,
  | SharedFlagsWithCredentialNames
  | 'serviceSid'
  | 'buildSid'
  | 'sourceEnvironment'
  | 'environment'
  | 'production'
  | 'createEnvironment'
  | 'force'
  | 'outputFormat'
>;
export type PromoteCliFlags = Arguments<ConfigurablePromoteCliFlags>;

export async function getConfigFromFlags(
  flags: PromoteCliFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<PromoteConfig> {
  let cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();
  flags.cwd = cwd;

  if (flags.production) {
    flags.environment = '';
  }

  const configFlags = readSpecializedConfig(cwd, flags.config, 'promote', {
    username:
      flags.username ||
      (externalCliOptions && externalCliOptions.accountSid) ||
      undefined,
    environmentSuffix: flags.environment,
    region: flags.region,
  });

  flags = mergeFlagsAndConfig<PromoteCliFlags>(configFlags, flags, cliInfo);
  cwd = flags.cwd || cwd;

  const { localEnv: envVariables } = await readLocalEnvFile(flags);
  const { username, password } = await getCredentialsFromFlags(
    flags,
    envVariables,
    externalCliOptions
  );
  const env = filterEnvVariablesForDeploy(envVariables);

  const command = getFullCommand(flags);

  const potentialServiceSid =
    flags.serviceSid ||
    (await getFunctionServiceSid(
      cwd,
      flags.config,
      'promote',
      flags.username?.startsWith('AC')
        ? flags.username
        : username.startsWith('AC')
        ? username
        : externalCliOptions?.accountSid,
      flags.region
    ));

  const serviceSid = checkForValidServiceSid(command, potentialServiceSid);
  const region = flags.region;
  const edge = flags.edge;
  const outputFormat = flags.outputFormat || externalCliOptions?.outputFormat;

  return {
    cwd,
    username,
    password,
    serviceSid,
    force: flags.force,
    createEnvironment: flags.createEnvironment,
    buildSid: flags.buildSid,
    targetEnvironment: flags.environment,
    sourceEnvironment: flags.sourceEnvironment,
    region,
    edge,
    env,
    userAgentExtensions: getUserAgentExtensions('promote', externalCliOptions),
    outputFormat,
  };
}
