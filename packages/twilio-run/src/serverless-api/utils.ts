import { readSpecializedConfig } from '../config/global';
import {
  getDeployInfoCache,
  updateDeployInfoCache,
} from '../utils/deployInfoCache';
import { getDebugFunction } from '../utils/logger';

const debug = getDebugFunction('twilio-run:internal:utils');

export interface HttpError extends Error {
  name: 'HTTPError';
  body: string;
}

export type ApiErrorResponse = {
  code: number;
  message: string;
  more_info: string;
};

export async function getFunctionServiceSid(
  cwd: string,
  configName: string,
  commandConfig: 'deploy' | 'list' | 'logs' | 'promote' | 'env',
  username?: string
): Promise<string | undefined> {
  const twilioConfig = readSpecializedConfig(cwd, configName, commandConfig, {
    username,
  });
  if (twilioConfig.serviceSid) {
    debug('Found serviceSid in config, "%s"', twilioConfig.serviceSid);
    return twilioConfig.serviceSid;
  }

  if (username) {
    debug('Attempting to read serviceSid from a deployinfo file');
    const deployInfoCache = getDeployInfoCache(cwd);
    if (
      deployInfoCache &&
      deployInfoCache[username] &&
      deployInfoCache[username].serviceSid
    ) {
      debug(
        'Found service sid from deploy info, "%s"',
        deployInfoCache[username].serviceSid
      );
      return deployInfoCache[username].serviceSid;
    }
  }

  debug('Could not determine existing serviceSid');
  return undefined;
}

export async function saveLatestDeploymentData(
  cwd: string,
  serviceSid: string,
  buildSid: string,
  username?: string
): Promise<void> {
  if (!username) {
    return;
  }

  return updateDeployInfoCache(cwd, username, {
    serviceSid,
    latestBuild: buildSid,
  });
}
