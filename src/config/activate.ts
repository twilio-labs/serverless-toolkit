import { ActivateConfig as ApiActivateConfig } from '@twilio-labs/serverless-api';
import dotenv from 'dotenv';
import path from 'path';
import { Arguments } from 'yargs';
import checkForValidServiceSid from '../checks/check-service-sid';
import { cliInfo } from '../commands/activate';
import { SharedFlags } from '../commands/shared';
import { getFullCommand } from '../commands/utils';
import { fileExists, readFile } from '../utils/fs';
import { mergeFlagsAndConfig, readSpecializedConfig } from './global';

type ActivateConfig = ApiActivateConfig & {
  cwd: string;
  accountSid?: string;
  authToken?: string;
};

export type ActivateCliFlags = Arguments<
  SharedFlags & {
    accountSid?: string;
    authToken?: string;
    cwd?: string;
    serviceSid?: string;
    buildSid?: string;
    sourceEnvironment?: string;
    environment: string;
    createEnvironment: boolean;
    force: boolean;
    env?: string;
  }
> & {
  _cliDefault?: {
    username: string;
    password: string;
  };
};

export async function getConfigFromFlags(
  flags: ActivateCliFlags
): Promise<ActivateConfig> {
  const cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();
  const configFlags = readSpecializedConfig(
    cwd,
    flags.config,
    'activateConfig',
    {
      projectId: flags.accountSid,
      environmentSuffix: flags.environment,
    }
  );

  flags = mergeFlagsAndConfig(configFlags, flags, cliInfo);

  let { accountSid: rawAccountSid, authToken: rawAuthToken } = flags;

  let accountSid = '';
  if (typeof rawAccountSid === 'string') {
    accountSid = rawAccountSid;
  }

  let authToken = '';
  if (typeof rawAuthToken === 'string') {
    authToken = rawAuthToken;
  }

  if (!accountSid || !authToken) {
    const envPath = path.resolve(cwd, flags.env || '.env');
    let contentEnvFile;
    if (!(await fileExists(envPath))) {
      contentEnvFile = '';
    } else {
      contentEnvFile = await readFile(envPath, 'utf8');
    }

    const localEnv = dotenv.parse(contentEnvFile);
    accountSid =
      accountSid ||
      localEnv.ACCOUNT_SID ||
      (flags._cliDefault && flags._cliDefault.username) ||
      '';
    authToken =
      authToken ||
      localEnv.AUTH_TOKEN ||
      (flags._cliDefault && flags._cliDefault.password) ||
      '';
  }

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
