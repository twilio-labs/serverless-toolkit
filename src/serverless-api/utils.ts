import debug from 'debug';
import path from 'path';
import { fileExists, readFile, writeFile } from '../utils/fs';

const log = debug('twilio-run:internal:utils');

export interface HttpError extends Error {
  name: 'HTTPError';
  body: {
    message: string;
  };
}

export async function getFunctionServiceSid(
  cwd: string
): Promise<string | undefined> {
  const configPath = path.join(cwd, '.twilio-functions');
  if (!(await fileExists(configPath))) {
    return undefined;
  }

  try {
    const twilioConfig = JSON.parse(await readFile(configPath, 'utf8'));
    return twilioConfig.serviceSid;
  } catch (err) {
    log('Could not find local config');
    return undefined;
  }
}

export async function saveLatestDeploymentData(
  cwd: string,
  serviceSid: string,
  buildSid: string
): Promise<void> {
  const configPath = path.join(cwd, '.twilio-functions');
  if (!(await fileExists(configPath))) {
    const output = JSON.stringify(
      { serviceSid, latestBuild: buildSid },
      null,
      2
    );
    return writeFile(configPath, output, 'utf8');
  }

  try {
    const twilioConfig = JSON.parse(await readFile(configPath, 'utf8'));
    const output = JSON.stringify({
      ...twilioConfig,
      serviceSid,
      latestBuild: buildSid,
    });
    return writeFile(configPath, output, 'utf8');
  } catch (err) {
    const output = JSON.stringify(
      { serviceSid, latestBuild: buildSid },
      null,
      2
    );
    return writeFile(configPath, output, 'utf8');
  }
}
