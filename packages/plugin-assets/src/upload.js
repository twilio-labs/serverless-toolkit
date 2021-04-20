const { TwilioServerlessApiClient } = require('@twilio-labs/serverless-api');
const {
  getEnvironment,
} = require('@twilio-labs/serverless-api/dist/api/environments');
const {
  createAssetResource,
  listAssetResources,
  createAssetVersion,
} = require('@twilio-labs/serverless-api/dist/api/assets');
const {
  triggerBuild,
  activateBuild,
  waitForSuccessfulBuild,
  getBuild,
} = require('@twilio-labs/serverless-api/dist/api/builds');
const inquirer = require('inquirer');

const { resolve, basename } = require('path');
const { readFile } = require('fs').promises;
const EventEmitter = require('events');

const { ConfigStore } = require('./configStore');
const { createUtils } = require('./utils');
const { printInBox } = require('./print');
const {
  listFunctionResources,
} = require('@twilio-labs/serverless-api/dist/api/functions');

const { spinner, debug, handleError } = createUtils('upload');

const upload = async ({ configDir, apiKey, apiSecret, accountSid, file }) => {
  let environment,
    build,
    assetContent,
    filePath,
    existingAssets,
    assetVersion,
    assetVersions = [];

  spinner.start('Loading config');
  const configStore = new ConfigStore(configDir);
  const config = await configStore.load();
  if (
    config[accountSid] &&
    config[accountSid].serviceSid &&
    config[accountSid].environmentSid
  ) {
    const { serviceSid, environmentSid } = config[accountSid];
    const client = new TwilioServerlessApiClient({
      username: apiKey,
      password: apiSecret,
    });
    spinner.text = 'Checking assets service';
    try {
      debug(
        `Fetching environment with sid ${environmentSid} from service with sid ${serviceSid}`
      );
      environment = await getEnvironment(environmentSid, serviceSid, client);
    } catch (error) {
      handleError(error, 'Could not fetch asset service environment');
      return;
    }
    try {
      debug(`Checking for functions in service with sid ${serviceSid}`);
      const functions = await listFunctionResources(serviceSid, client);
      if (functions.length > 0) {
        spinner.fail('Not an Asset Plugin service: service contains functions');
        return;
      }
    } catch (error) {
      handleError(
        error,
        'Could not fetch last build of asset service environment'
      );
      return;
    }
    spinner.text = 'Preparing asset';
    try {
      filePath = resolve(file);
      debug(`Reading file from ${filePath}`);
      assetContent = await readFile(filePath);
    } catch (error) {
      handleError(error, `Could not read ${filePath}`);
      return;
    }
    const path = `/${basename(filePath)}`;
    const newAsset = {
      name: path,
      access: 'public',
      path,
      content: assetContent,
    };

    try {
      debug('Finding existing asset resources');
      existingAssets = await listAssetResources(serviceSid, client);
    } catch (error) {
      handleError(error, 'Could not load existing asset resources');
    }
    const existingAsset = existingAssets.find(
      asset => asset.friendly_name === newAsset.name
    );
    if (existingAsset) {
      spinner.stop();
      const answers = await inquirer.prompt([
        {
          message: `There is already an asset called ${existingAsset.friendly_name}. What do you want to do?`,
          type: 'list',
          name: 'conflict',
          choices: ['Overwrite', 'Rename', 'Abort'],
        },
      ]);
      if (answers.conflict === 'Overwrite') {
        newAsset.sid = existingAsset.sid;
      } else if (answers.conflict === 'Rename') {
        let newNameAnswers = await inquirer.prompt([
          {
            name: 'newName',
            type: 'input',
            message: 'Enter a new filename:',
          },
        ]);
        while (
          existingAssets.find(
            asset => asset.friendly_name === newNameAnswers.newName
          )
        ) {
          newNameAnswers = await inquirer.prompt([
            {
              name: 'newName',
              type: 'input',
              message: 'That filename also exists, please enter another:',
            },
          ]);
        }
        newAsset.name = newAsset.path = newNameAnswers.newName;
        spinner.start('Creating new asset');
        try {
          debug(`Creating new asset resource called ${newAsset.name}`);
          const assetResource = await createAssetResource(
            newAsset.name,
            serviceSid,
            client
          );
          newAsset.sid = assetResource.sid;
        } catch (error) {
          handleError(error, 'Could not create new asset resource');
          return;
        }
      } else if (answers.conflict === 'Abort') {
        spinner.fail('Upload cancelled');
        return;
      }
    } else {
      try {
        spinner.start('Creating new asset');
        debug(`Creating new asset resource called ${newAsset.name}`);
        const assetResource = await createAssetResource(
          newAsset.name,
          serviceSid,
          client
        );
        newAsset.sid = assetResource.sid;
      } catch (error) {
        handleError(error, 'Could not create new asset resource');
        return;
      }
    }
    try {
      debug(`Creating new asset version for asset with sid ${newAsset.sid}`);
      assetVersion = await createAssetVersion(newAsset, serviceSid, client, {});
    } catch (error) {
      handleError(error, 'Could not create new asset version');
      return;
    }
    assetVersions.push(assetVersion.sid);
    if (environment.build_sid) {
      debug(
        `Getting existing asset versions from build with sid ${environment.build_sid}`
      );
      const lastBuild = await getBuild(
        environment.build_sid,
        serviceSid,
        client
      );
      lastBuild.asset_versions
        .filter(av => av.asset_sid !== assetVersion.asset_sid)
        .forEach(assetVersion => assetVersions.push(assetVersion.sid));
    }
    try {
      debug(`Triggering new build for ${assetVersions.length} asset versions`);
      build = await triggerBuild(
        { assetVersions: assetVersions },
        serviceSid,
        client
      );
    } catch (error) {
      handleError(error, 'Could not create a new build');
      return;
    }
    try {
      const updateHandler = new EventEmitter();
      updateHandler.on('status-update', update => {
        debug(update.message);
      });
      await waitForSuccessfulBuild(
        build.sid,
        serviceSid,
        client,
        updateHandler
      );
    } catch (error) {
      handleError(error, 'Error while waiting for the build to complete');
      return;
    }
    try {
      debug(`Activating build with sid ${build.sid}`);
      await activateBuild(build.sid, environment.sid, serviceSid, client);
      spinner.succeed('Asset deployed');
      printInBox(
        'Your asset has been uploaded',
        `Your new asset: https://${environment.domain_name}${assetVersion.path}`
      );
    } catch (error) {
      handleError(error, 'Could not activate build');
      return;
    }
  } else {
    spinner.fail(
      'No Service Sid or Environment Sid provided. Make sure you run `twilio assets:init` before trying to upload your first asset'
    );
  }
};

module.exports = { upload };
