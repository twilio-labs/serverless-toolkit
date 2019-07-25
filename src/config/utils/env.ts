import dotenv from 'dotenv';
import path from 'path';
import { EnvironmentVariablesWithAuth } from '../../types/generic';
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
