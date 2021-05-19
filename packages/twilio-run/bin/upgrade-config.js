#!/usr/bin/env node

// Migration script to transform .twilio-functions files into the appropriate
// .twilioserverlessrc and .twiliodeployinfo files

const path = require('path');
const inquirer = require('inquirer');
const { fileExists, readFile, writeFile } = require('../dist/utils/fs');
const { writeDefaultConfigFile } = require('../dist/templating/defaultConfig');
const { readLocalEnvFile } = require('../dist/config/utils/env');
const rimraf = require('rimraf');

async function run() {
  const oldConfigPath = path.resolve(
    process.cwd(),
    process.argv[2] || '.twilio-functions'
  );

  if (!fileExists(oldConfigPath)) {
    console.error('Could not find an old config file at "%s"', oldConfigPath);
    return 1;
  }

  let oldConfigContent = undefined;

  try {
    oldConfigContent = JSON.parse(await readFile(oldConfigPath, 'utf8'));
  } catch (err) {
    console.error(err);
  }

  if (!oldConfigContent) {
    console.error('Could not read old config file.');
    return 1;
  }

  let accountSidForDeployInfo = oldConfigContent.accountSid;
  if (!accountSidForDeployInfo) {
    const envFileContent = await readLocalEnvFile({
      cwd: process.cwd(),
      env: '.env',
      loadSystemEnv: false,
    });

    if (envFileContent.localEnv.ACCOUNT_SID) {
      accountSidForDeployInfo = envFileContent.localEnv.ACCOUNT_SID;
    }
  }

  const deployInfo = {};

  if (oldConfigContent.serviceSid) {
    const promptResults = await inquirer.prompt([
      {
        type: 'input',
        default: accountSidForDeployInfo,
        message: `Please enter your Twilio Account SID for your Functions Service: ${oldConfigContent.serviceSid}`,
        name: 'accountSid',
        validate: (input) =>
          (input.startsWith('AC') && input.length === 34) ||
          'Please enter a valid account SID. It should start with AC and is 34 characters long.',
      },
    ]);

    deployInfo[promptResults.accountSid] = {
      serviceSid: oldConfigContent.serviceSid,
      latestBuild: oldConfigContent.latestBuild,
    };
  }

  let hasCustomConfigPerProject = false;
  if (oldConfigContent.projects) {
    const projects = oldConfigContent.projects;
    for (const accountSid of Object.keys(projects)) {
      if (Object.keys(projects[accountSid]).length > 2) {
        hasCustomConfigPerProject = true;
      } else if (
        Object.keys(projects[accountSid]).length === 2 &&
        (!projects[accountSid].serviceSid || !projects[accountSid].latestBuild)
      ) {
        hasCustomConfigPerProject = true;
      }

      deployInfo[accountSid] = {
        serviceSid: projects[accountSid].serviceSid,
        latestBuild: projects[accountSid].latestBuild,
      };
    }
  }

  const deployInfoPath = path.resolve(process.cwd(), '.twiliodeployinfo');

  console.info(`Writing file to ${deployInfoPath}`);
  await writeFile(deployInfoPath, JSON.stringify(deployInfo, null, '\t'));

  let hasCustomConfig =
    Object.keys(oldConfigContent).length > 3 || hasCustomConfigPerProject;
  // moving custom config in a programmatic way is complex since the nesting that the old structure allowed can be quite confusing.
  // so instead we'll ask people to move those manually
  if (hasCustomConfig) {
    console.info(
      'We detected that your .twilio-functions file has some custom config. Unfortunately we cannot migrate it automatically. Please head to twil.io/serverless-config for more information on how to manually move your config.'
    );
  }

  const writtenNewConfig = await writeDefaultConfigFile(process.cwd(), false);
  if (!writtenNewConfig) {
    console.info(
      'Detected an existing .twilioserverlessrc and did not override it.'
    );
  } else {
    console.info(
      'Created new config file at %s',
      path.resolve(process.cwd(), '.twilioserverlessrc')
    );
  }

  if (!hasCustomConfig) {
    const deletePrompt = await inquirer.prompt([
      {
        name: 'deleteOldConfig',
        type: 'confirm',
        message:
          'Do you want to delete your old config file? Alternatively you can delete it manually later on.',
        default: false,
      },
    ]);

    if (deletePrompt.deleteOldConfig) {
      rimraf.sync(oldConfigPath, { rmdir: false });
      console.info('Old .twilio-functions file deleted.');
    }
  }
}

run()
  .then((exitCode) => process.exit(exitCode || 0))
  .catch(console.error);
