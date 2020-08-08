import { EnvironmentVariables } from '@twilio-labs/serverless-api';
import { stripIndent } from 'common-tags';
import dotenv from 'dotenv';
import path from 'path';
import { EnvironmentVariablesWithAuth } from '../../types/generic';
import { fileExists, readFile } from '../../utils/fs';

export async function readLocalEnvFile(flags: {
  cwd?: string;
  env?: string;
  loadSystemEnv?: boolean;
}): Promise<{ localEnv: EnvironmentVariablesWithAuth; envPath: string }> {
  if (flags.loadSystemEnv && typeof flags.env === 'undefined') {
    throw new Error(stripIndent`
      If you are using --load-system-env you'll also have to supply a --env flag.
      
      The .env file you are pointing at will be used to primarily load environment variables.
      Any empty entries in the .env file will fall back to the system's environment variables.
    `);
  }

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

    let localEnv;
    try {
      localEnv = dotenv.parse(contentEnvFile);
    } catch (err) {
      throw new Error('Failed to parse .env file');
    }

    if (flags.loadSystemEnv && typeof flags.env !== 'undefined') {
      for (const key of Object.keys(localEnv)) {
        const systemValue = process.env[key];
        if (systemValue) {
          localEnv[key] = localEnv[key] || systemValue;
        }
      }
    }

    return { localEnv, envPath };
  }
  return { envPath: '', localEnv: {} };
}

export function filterEnvVariablesForDeploy(
  localEnv: EnvironmentVariablesWithAuth
): EnvironmentVariables {
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

  return env;
}
