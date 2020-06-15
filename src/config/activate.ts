import { ActivateConfig as ApiActivateConfig } from '@twilio-labs/serverless-api';
import path from 'path';
import { Arguments } from 'yargs';
import checkForValidServiceSid from '../checks/check-service-sid';
import { cliInfo } from '../commands/activate';
import {
  ExternalCliOptions,
  SharedFlagsWithCredentials,
} from '../commands/shared';
import { getFullCommand } from '../commands/utils';
import { readSpecializedConfig } from './global';
import { getCredentialsFromFlags, readLocalEnvFile, prepareEnvForDeploy } from './utils';
import { mergeFlagsAndConfig } from './utils/mergeFlagsAndConfig';

type ActivateConfig = ApiActivateConfig & {
  cwd: string;
  accountSid?: string;
  authToken?: string;
};

export type ActivateCliFlags = Arguments<
  SharedFlagsWithCredentials & {
    cwd?: string;
    serviceSid?: string;
    buildSid?: string;
    sourceEnvironment?: string;
    environment: string;
    production: boolean;
    createEnvironment: boolean;
    force: boolean;
  }
>;

export async function getConfigFromFlags(
  flags: ActivateCliFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<ActivateConfig> {
  let cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();
  flags.cwd = cwd;
  const configFlags = readSpecializedConfig(
    cwd,
    flags.config,
    'activateConfig',
    {
      projectId:
        flags.accountSid ||
        (externalCliOptions && externalCliOptions.accountSid) ||
        undefined,
      environmentSuffix: flags.environment,
    }
  );

  flags = mergeFlagsAndConfig(configFlags, flags, cliInfo);
  cwd = flags.cwd || cwd;

  if (flags.production) {
    flags.environment = '';
  }

  const { accountSid, authToken } = await getCredentialsFromFlags(
    flags,
    externalCliOptions
  );
  const { localEnv } = await readLocalEnvFile(flags);
  const env = prepareEnvForDeploy(localEnv);

  const command = getFullCommand(flags);
  const serviceSid = checkForValidServiceSid(command, flags.serviceSid);
  const region = flags.region;
  const edge = flags.edge;

  return {
    cwd,
    accountSid,
    authToken,
    serviceSid,
    force: flags.force,
    createEnvironment: flags.createEnvironment,
    buildSid: flags.buildSid,
    targetEnvironment: flags.environment,
    sourceEnvironment: flags.sourceEnvironment,
    region,
    edge,
    env
  };
}
