import { EnvironmentVariablesWithAuth } from '../../types/generic';
import { ILogger } from '../../utils/logger';
import { runHook } from './run-hook';

export async function executePostInstallHook(
  rawScript: string,
  env: EnvironmentVariablesWithAuth,
  logger: Console | ILogger
) {
  return runHook('postinstall', rawScript, env, logger);
}
