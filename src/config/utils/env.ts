import dotenv from 'dotenv';
import path from 'path';
import { EnvironmentVariablesWithAuth } from '../../types/generic';
import { EnvironmentVariables } from '@twilio-labs/serverless-api';
import { fileExists, readFile } from '../../utils/fs';

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

export function prepareEnvForDeploy(localEnv: EnvironmentVariablesWithAuth): EnvironmentVariables {
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