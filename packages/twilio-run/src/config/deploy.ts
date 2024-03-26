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
import { getUserAgentExtensions } from './utils/userAgentExtensions';

export type DeployLocalProjectConfig = ApiDeployLocalProjectConfig & {
  username: string;
  password: string;
  outputFormat?: string;
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
  | 'outputFormat'
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
    username:
      flags.username ||
      (externalCliOptions && externalCliOptions.accountSid) ||
      undefined,
    environmentSuffix: flags.environment,
    region: flags.region,
  });

  flags = mergeFlagsAndConfig<DeployCliFlags>(configFlags, flags, cliInfo);
  cwd = flags.cwd || cwd;

  const { localEnv: envFileVars, envPath } = await readLocalEnvFile(flags);
  const { username, password } = await getCredentialsFromFlags(
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
      flags.username && flags.username.startsWith('AC')
        ? flags.username
        : username.startsWith('AC')
        ? username
        : externalCliOptions?.accountSid,
      flags.region
    ));

  const pkgJson = await readPackageJsonContent(flags);

  let serviceName: string | undefined = await getServiceNameFromFlags(flags);

  if (serviceSid?.startsWith('ZS')) {
    serviceName = '';
  } else if (!serviceName) {
    throw new Error(
      'Please pass --service-name or add a "name" field to your package.json'
    );
  }

  const { region, edge, runtime } = flags;
  const outputFormat = flags.outputFormat || externalCliOptions?.outputFormat;

  return {
    cwd,
    envPath,
    username,
    password,
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
    userAgentExtensions: getUserAgentExtensions('deploy', externalCliOptions),
    outputFormat,
  };
}
