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
  commandConfig: 'deployConfig' | 'listConfig' | 'activateConfig',
  projectId?: string
): Promise<string | undefined> {
  const twilioConfig = readSpecializedConfig(cwd, configName, commandConfig, {
    projectId,
  });
  return twilioConfig.serviceSid;
}

export async function saveLatestDeploymentData(
  cwd: string,
  serviceSid: string,
  buildSid: string,
  projectId?: string
): Promise<void> {
  const config = getConfig(cwd);
  if (!config.has('serviceSid')) {
    config.set('serviceSid', serviceSid);
  }

  if (config.get('serviceSid') === serviceSid) {
    config.set('latestBuild', buildSid);
  }

  if (projectId) {
    if (!config.has(`projects.${projectId}.serviceSid`)) {
      config.set(`projects.${projectId}.serviceSid`, serviceSid);
    }
    config.set(`projects.${projectId}.latestBuild`, buildSid);
  }
}
