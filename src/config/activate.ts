import { ActivateConfig as ApiActivateConfig } from '@twilio-labs/serverless-api';
import path from 'path';
import { Arguments } from 'yargs';
import checkForValidServiceSid from '../checks/check-service-sid';
import { cliInfo } from '../commands/activate';
import {
  ExternalCliOptions,
  SharedFlagsWithCrdentials,
} from '../commands/shared';
import { getFullCommand } from '../commands/utils';
import { mergeFlagsAndConfig, readSpecializedConfig } from './global';
import { getCredentialsFromFlags } from './utils';

type ActivateConfig = ApiActivateConfig & {
  cwd: string;
  accountSid?: string;
  authToken?: string;
};

export type ActivateCliFlags = Arguments<
  SharedFlagsWithCrdentials & {
    cwd?: string;
    serviceSid?: string;
    buildSid?: string;
    sourceEnvironment?: string;
    environment: string;
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

  const { accountSid, authToken } = await getCredentialsFromFlags(
    flags,
    externalCliOptions
  );

  const command = getFullCommand(flags);
  const serviceSid = checkForValidServiceSid(command, flags.serviceSid);

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
  };
}
