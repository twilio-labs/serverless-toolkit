import {
  ListConfig as ApiListConfig,
  ListOptions,
} from '@twilio-labs/serverless-api';
import dotenv from 'dotenv';
import path from 'path';
import { PackageJson } from 'type-fest';
import { Arguments } from 'yargs';
import { cliInfo } from '../commands/list';
import { SharedFlags } from '../commands/shared';
import { deprecateProjectName } from '../commands/utils';
import { getFunctionServiceSid } from '../serverless-api/utils';
import { fileExists, readFile } from '../utils/fs';
import { mergeFlagsAndConfig, readSpecializedConfig } from './global';

export type ListConfig = ApiListConfig & {
  cwd: string;
  properties?: string[];
  extendedOutput: boolean;
};

export type ListCliFlags = Arguments<
  SharedFlags & {
    types: string;
    projectName?: string;
    serviceName?: string;
    properties?: string;
    extendedOutput: boolean;
    cwd?: string;
    environment?: string;
    accountSid?: string;
    authToken?: string;
    serviceSid?: string;
    env?: string;
  }
> & {
  _cliDefault?: {
    username: string;
    password: string;
  };
};

export async function getConfigFromFlags(
  flags: ListCliFlags
): Promise<ListConfig> {
  const cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();
  const configFlags = readSpecializedConfig(cwd, flags.config, 'listConfig', {
    projectId: flags.accountSid,
    environmentSuffix: flags.environment,
  });

  flags = mergeFlagsAndConfig(configFlags, flags, cliInfo);

  let { accountSid, authToken } = flags;
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
      flags.accountSid ||
      localEnv.ACCOUNT_SID ||
      (flags._cliDefault && flags._cliDefault.username) ||
      '';
    authToken =
      flags.authToken ||
      localEnv.AUTH_TOKEN ||
      (flags._cliDefault && flags._cliDefault.password) ||
      '';
  }

  const serviceSid =
    flags.serviceSid ||
    (await getFunctionServiceSid(cwd, flags.config, 'listConfig'));

  let serviceName = flags.serviceName;

  if (typeof flags.projectName !== 'undefined') {
    deprecateProjectName();
    if (!serviceName) {
      serviceName = flags.projectName;
    }
  }

  if (!serviceName) {
    const pkgJsonPath = path.join(cwd, 'package.json');
    if (await fileExists(pkgJsonPath)) {
      const pkgContent = await readFile(pkgJsonPath, 'utf8');
      const pkgJson: PackageJson = JSON.parse(pkgContent);
      if (typeof pkgJson.name === 'string') {
        serviceName = pkgJson.name;
      }
    }
  }

  const types = flags.types.split(',') as ListOptions[];

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
  };
}
