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
  commandConfig: 'deploy' | 'list' | 'logs' | 'promote',
  accountSid?: string
): Promise<string | undefined> {
  const twilioConfig = readSpecializedConfig(cwd, configName, commandConfig, {
    accountSid,
  });
  if (twilioConfig.serviceSid) {
    debug('Found serviceSid in config, "%s"', twilioConfig.serviceSid);
    return twilioConfig.serviceSid;
  }

  if (accountSid) {
    debug('Attempting to read serviceSid from a deployinfo file');
    const deployInfoCache = getDeployInfoCache(cwd);
    if (
      deployInfoCache &&
      deployInfoCache[accountSid] &&
      deployInfoCache[accountSid].serviceSid
    ) {
      debug(
        'Found service sid from debug info, "%s"',
        deployInfoCache[accountSid].serviceSid
      );
      return deployInfoCache[accountSid].serviceSid;
    }
  }

  debug('Could not determine existing serviceSid');
  return undefined;
}

export async function saveLatestDeploymentData(
  cwd: string,
  serviceSid: string,
  buildSid: string,
  accountSid?: string
): Promise<void> {
  if (!accountSid) {
    return;
  }

  return updateDeployInfoCache(cwd, accountSid, {
    serviceSid,
    latestBuild: buildSid,
  });
}
