import { DeployLocalProjectConfig } from '@twilio-labs/serverless-api';
import dotenv from 'dotenv';
import path from 'path';
import { Arguments } from 'yargs';
import { cliInfo } from '../commands/deploy';
import { SharedFlags } from '../commands/shared';
import { deprecateFunctionsEnv, deprecateProjectName } from '../commands/utils';
import { getFunctionServiceSid } from '../serverless-api/utils';
import { EnvironmentVariablesWithAuth } from '../types/generic';
import { fileExists, readFile } from '../utils/fs';
import { mergeFlagsAndConfig, readSpecializedConfig } from './global';

export type DeployCliFlags = Arguments<
  SharedFlags & {
    cwd?: string;
    serviceSid?: string;
    functionsEnv?: string;
    environment: string;
    projectName?: string;
    serviceName?: string;
    accountSid?: string;
    authToken?: string;
    env?: string;
    overrideExistingProject: boolean;
    force: boolean;
    functions: boolean;
    assets: boolean;
    assetsFolder?: string;
    functionsFolder?: string;
  }
> & {
  _cliDefault?: {
    username: string;
    password: string;
  };
};

export async function getConfigFromFlags(
  flags: DeployCliFlags
): Promise<DeployLocalProjectConfig> {
  const cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();

  if (typeof flags.functionsEnv !== 'undefined') {
    deprecateFunctionsEnv();
    if (!flags.environment) {
      flags.environment = flags.functionsEnv;
    }
    delete flags.functionsEnv;
  }

  const configFlags = readSpecializedConfig(cwd, flags.config, 'deployConfig', {
    projectId: flags.accountSid,
    environmentSuffix: flags.environment,
  });

  flags = mergeFlagsAndConfig(configFlags, flags, cliInfo);

  let accountSid = '';
  let authToken = '';
  let localEnv: EnvironmentVariablesWithAuth = {};

  const envPath = path.resolve(cwd, flags.env || '.env');

  if (await fileExists(envPath)) {
    const contentEnvFile = await readFile(envPath, 'utf8');
    localEnv = dotenv.parse(contentEnvFile);

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
  } else if (flags.env) {
    throw new Error(`Failed to find .env file at "${envPath}"`);
  }

  const serviceSid =
    flags.serviceSid ||
    (await getFunctionServiceSid(cwd, flags.config, 'deployConfig'));

  const pkgJsonPath = path.join(cwd, 'package.json');
  if (!(await fileExists(pkgJsonPath))) {
    throw new Error('Failed to find package.json file');
  }

  const pkgContent = await readFile(pkgJsonPath, 'utf8');
  const pkgJson = JSON.parse(pkgContent);

  const env = {
    ...localEnv,
  };

  for (let key of Object.keys(env)) {
    const val = env[key];
    if (typeof val === 'string' && val.length === 0) {
      delete env[key];
    }
  }

  delete env.ACCOUNT_SID;
  delete env.AUTH_TOKEN;

  let serviceName: string | undefined = flags.serviceName || pkgJson.name;
  if (typeof flags.projectName !== 'undefined') {
    deprecateProjectName();
    if (!serviceName) {
      serviceName = flags.projectName;
    }
  }

  if (!serviceName) {
    throw new Error(
      'Please pass --service-name or add a "name" field to your package.json'
    );
  }

  return {
    cwd,
    envPath,
    accountSid,
    authToken,
    env,
    serviceSid,
    pkgJson,
    overrideExistingService: flags.overrideExistingProject,
    force: flags.force,
    serviceName,
    functionsEnv: flags.environment,
    functionsFolderName: flags.functionsFolder,
    assetsFolderName: flags.assetsFolder,
    noAssets: !flags.assets,
    noFunctions: !flags.functions,
  };
}
