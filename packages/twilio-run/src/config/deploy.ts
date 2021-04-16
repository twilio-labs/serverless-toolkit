import { DeployLocalProjectConfig as ApiDeployLocalProjectConfig } from '@twilio-labs/serverless-api';
import path from 'path';
import { Arguments } from 'yargs';
import { cliInfo } from '../commands/deploy';
import { ExternalCliOptions } from '../commands/shared';
import { deprecateFunctionsEnv } from '../commands/utils';
import {
  AllAvailableFlagTypes,
  SharedFlagsWithCredentialNames,
} from '../flags';
import { getFunctionServiceSid } from '../serverless-api/utils';
import { readSpecializedConfig } from './global';
import {
  filterEnvVariablesForDeploy,
  getCredentialsFromFlags,
  getServiceNameFromFlags,
  readLocalEnvFile,
  readPackageJsonContent,
} from './utils';
import { mergeFlagsAndConfig } from './utils/mergeFlagsAndConfig';

export type DeployLocalProjectConfig = ApiDeployLocalProjectConfig & {
  username: string;
  password: string;
};

export type ConfigurableDeployCliFlags = Pick<
  AllAvailableFlagTypes,
  | SharedFlagsWithCredentialNames
  | 'serviceSid'
  | 'environment'
  | 'production'
  | 'serviceName'
  | 'overrideExistingProject'
  | 'force'
  | 'functions'
  | 'assets'
  | 'assetsFolder'
  | 'functionsFolder'
  | 'runtime'
>;
export type DeployCliFlags = Arguments<
  ConfigurableDeployCliFlags & {
    functionsEnv?: string;
    projectName?: string;
  }
>;

export async function getConfigFromFlags(
  flags: DeployCliFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<DeployLocalProjectConfig> {
  let cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();
  flags.cwd = cwd;

  if (typeof flags.functionsEnv !== 'undefined') {
    deprecateFunctionsEnv();
    if (!flags.environment) {
      flags.environment = flags.functionsEnv;
    }
    delete flags.functionsEnv;
  }

  if (flags.production) {
    flags.environment = '';
  }

  const configFlags = readSpecializedConfig(cwd, flags.config, 'deploy', {
    accountSid:
      flags.accountSid ||
      (externalCliOptions && externalCliOptions.accountSid) ||
      undefined,
    environmentSuffix: flags.environment,
  });

  flags = mergeFlagsAndConfig<DeployCliFlags>(configFlags, flags, cliInfo);
  cwd = flags.cwd || cwd;

  const { localEnv: envFileVars, envPath } = await readLocalEnvFile(flags);
  const { accountSid, authToken } = await getCredentialsFromFlags(
    flags,
    envFileVars,
    externalCliOptions
  );

  const env = filterEnvVariablesForDeploy(envFileVars);

  const serviceSid =
    flags.serviceSid ||
    (await getFunctionServiceSid(
      cwd,
      flags.config,
      'deploy',
      flags.accountSid && flags.accountSid.startsWith('AC')
        ? flags.accountSid
        : accountSid.startsWith('AC')
        ? accountSid
        : externalCliOptions?.accountSid
    ));

  const pkgJson = await readPackageJsonContent(flags);

  let serviceName: string | undefined = await getServiceNameFromFlags(flags);

  if (!serviceName) {
    throw new Error(
      'Please pass --service-name or add a "name" field to your package.json'
    );
  }

  const { region, edge, runtime } = flags;

  return {
    cwd,
    envPath,
    username: accountSid,
    password: authToken,
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
    region,
    edge,
    runtime,
  };
}
