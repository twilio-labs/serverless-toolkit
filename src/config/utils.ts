import debug from 'debug';
import dotenv from 'dotenv';
import path from 'path';
import { PackageJson } from 'type-fest';
import { SharedFlags, SharedFlagsWithCrdentials } from '../commands/shared';
import { deprecateProjectName } from '../commands/utils';
import { EnvironmentVariablesWithAuth } from '../types/generic';
import { fileExists, readFile } from '../utils/fs';

const log = debug('twilio-run:config:utils');

type Credentials = {
  accountSid: string;
  authToken: string;
};

type FlagsWithServiceName = SharedFlags & {
  serviceName?: string;
  projectName?: string;
};

export async function getServiceNameFromFlags<T extends FlagsWithServiceName>(
  flags: T
): Promise<string | undefined> {
  let { serviceName, cwd } = flags;

  if (typeof flags.projectName !== 'undefined') {
    deprecateProjectName();
    if (!serviceName) {
      serviceName = flags.projectName;
    }
  }

  if (!serviceName && cwd) {
    try {
      const pkgJson = await readPackageJsonContent(flags);
      if (typeof pkgJson.name === 'string') {
        serviceName = pkgJson.name;
      }
    } catch (err) {
      log('%O', err);
    }
  }

  return serviceName;
}

export async function getCredentialsFromFlags<
  T extends SharedFlagsWithCrdentials
>(flags: T): Promise<Credentials> {
  let { accountSid, authToken, cwd } = flags;

  if (!accountSid || !authToken) {
    if (cwd) {
      const { localEnv } = await readLocalEnvFile(flags);

      accountSid = accountSid || localEnv.ACCOUNT_SID;
      authToken = authToken || localEnv.ACCOUNT_SID;
    }
  }
  return {
    accountSid:
      accountSid || (flags._cliDefault && flags._cliDefault.username) || '',
    authToken:
      authToken || (flags._cliDefault && flags._cliDefault.password) || '',
  };
}

export async function readPackageJsonContent({
  cwd,
}: SharedFlags): Promise<PackageJson> {
  if (!cwd) {
    throw new Error('Missing cwd to find package.json');
  }

  const pkgJsonPath = path.join(cwd, 'package.json');
  if (!(await fileExists(pkgJsonPath))) {
    throw new Error(`Failed to find package.json file at "${pkgJsonPath}"`);
  }

  const pkgContent = await readFile(pkgJsonPath, 'utf8');
  const pkgJson: PackageJson = JSON.parse(pkgContent);
  return pkgJson;
}

export async function readLocalEnvFile(flags: {
  cwd?: string;
  env?: string;
}): Promise<{ localEnv: EnvironmentVariablesWithAuth; envPath: string }> {
  if (flags.cwd) {
    const envPath = path.resolve(flags.cwd, flags.env || '.env');

    let contentEnvFile;
    if (await fileExists(envPath)) {
      contentEnvFile = await readFile(envPath, 'utf8');
    } else if (flags.env) {
      throw new Error(`Failed to find .env file at "${envPath}"`);
    } else {
      contentEnvFile = '';
    }

    const localEnv = dotenv.parse(contentEnvFile);

    return { localEnv, envPath };
  }
  return { envPath: '', localEnv: {} };
}
