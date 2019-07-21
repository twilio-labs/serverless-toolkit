import debug from 'debug';
import { getConfig, readSpecializedConfig } from '../config/global';

const log = debug('twilio-run:internal:utils');

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
  commandConfig: 'deployConfig' | 'listConfig' | 'activateConfig'
): Promise<string | undefined> {
  const twilioConfig = readSpecializedConfig(cwd, configName, commandConfig);
  return twilioConfig.serviceSid;
}

export async function saveLatestDeploymentData(
  cwd: string,
  projectId: string,
  serviceSid: string,
  buildSid: string
): Promise<void> {
  const config = getConfig(cwd);
  if (!config.has('serviceSid')) {
    config.set('serviceSid', serviceSid);
  }
  if (!config.has(`projects.${projectId}.serviceSid`)) {
    config.set(`projects.${projectId}.serviceSid`, serviceSid);
  }
  config.set(`projects.${projectId}.latestBuild`, buildSid);
}
