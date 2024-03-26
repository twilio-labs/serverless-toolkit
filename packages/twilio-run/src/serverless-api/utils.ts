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
  username?: string,
  region: string = 'us1'
): Promise<string | undefined> {
  const twilioConfig = readSpecializedConfig(cwd, configName, commandConfig, {
    username,
    region,
  });
  if (twilioConfig.serviceSid) {
    debug('Found serviceSid in config, "%s"', twilioConfig.serviceSid);
    return twilioConfig.serviceSid;
  }

  if (username) {
    debug('Attempting to read serviceSid from a deployinfo file');
    const deployInfoCache = getDeployInfoCache(cwd);
    if (deployInfoCache[`${username}:${region}`]?.serviceSid) {
      debug(
        'Found service sid by region from deploy info, "%s"',
        deployInfoCache[`${username}:${region}`].serviceSid
      );
      return deployInfoCache[`${username}:${region}`].serviceSid;
    }

    if (deployInfoCache[username]?.serviceSid) {
      debug(
        'Found service sid from deploy info, "%s"',
        deployInfoCache[username].serviceSid
      );
      return deployInfoCache[username].serviceSid;
    }
  }

  debug('Could not determine existing serviceSid');
  debug(`${username}:${region}`);
  return undefined;
}

export async function saveLatestDeploymentData(
  cwd: string,
  serviceSid: string,
  buildSid: string,
  username?: string,
  region?: string
): Promise<void> {
  if (!username) {
    return;
  }

  return updateDeployInfoCache(cwd, username, region, {
    serviceSid,
    latestBuild: buildSid,
  });
}
