const path = require('path');
const log = require('debug')('twilio-run:internal:utils');
const { fileExists, readFile, writeFile } = require('../utils/fs');

async function getFunctionServiceSid(cwd) {
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

async function saveLatestDeploymentData(cwd, serviceSid, buildSid) {
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

module.exports = { getFunctionServiceSid, saveLatestDeploymentData };
