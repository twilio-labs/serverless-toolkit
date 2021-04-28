const ora = require('ora');
const inquirer = require('inquirer');
const { TwilioServerlessApiClient } = require('@twilio-labs/serverless-api');
const { TwilioCliError } = require('@twilio/cli-core').services.error;
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

const { resolve, basename } = require('path');
const { readFile } = require('fs').promises;
const EventEmitter = require('events');

const {
  listFunctionResources,
} = require('@twilio-labs/serverless-api/dist/api/functions');

const { couldNotGetEnvironment, couldNotGetBuild } = require('./errorMessages');

async function upload({
  pluginConfig,
  apiKey,
  apiSecret,
  accountSid,
  file,
  logger,
}) {
  let environment,
    build,
    assetContent,
    filePath,
    existingAssets,
    assetVersion,
    assetVersions = [];

  const spinner = ora({
    isSilent: logger.config.level > 0,
  });

  function debug(message) {
    const wasSpinning = spinner.isSpinning;
    spinner.stop();
    logger.debug(message);
    if (wasSpinning) {
      spinner.start();
    }
  }

  function handleError(message, error) {
    spinner.stop();
    if (error) {
      debug(error.toString());
    }
    throw new TwilioCliError(message);
  }

  spinner.start('Loading config');
  const config = await pluginConfig.getConfig();
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
      handleError(
        couldNotGetEnvironment(accountSid, serviceSid, environmentSid),
        error
      );
    }
    try {
      debug(`Checking for functions in service with sid ${serviceSid}`);
      const functions = await listFunctionResources(serviceSid, client);
      if (functions.length > 0) {
        handleError('Not an Asset Plugin service: service contains functions');
      }
    } catch (error) {
      handleError(
        'Could not fetch last build of asset service environment',
        error
      );
    }
    spinner.text = 'Preparing asset';
    try {
      filePath = resolve(file);
      debug(`Reading file from ${filePath}`);
      assetContent = await readFile(filePath);
    } catch (error) {
      handleError(`Could not read ${filePath}`, error);
    }
    const path = `${basename(filePath)}`;
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
      handleError(
        `Could not load existing asset resources from service ${serviceSid}`,
        error
      );
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
        spinner.start('Overwriting existing asset');
      } else if (answers.conflict === 'Rename') {
        let newNameAnswers = await inquirer.prompt([
          {
            name: 'newName',
            type: 'input',
            message: 'Enter a new filename:',
          },
        ]);
        let newName = newNameAnswers.newName.trim();
        while (
          existingAssets.find(asset => asset.friendly_name === newName) ||
          newName === ''
        ) {
          const message =
            newName === ''
              ? 'Please enter a new filename'
              : 'That filename also exists, please enter another:';
          newNameAnswers = await inquirer.prompt([
            {
              name: 'newName',
              type: 'input',
              message,
            },
          ]);
          newName = newNameAnswers.newName.trim();
        }
        newAsset.name = newAsset.path = newName;
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
          handleError('Could not create new asset resource', error);
        }
      } else if (answers.conflict === 'Abort') {
        handleError('Upload cancelled');
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
        handleError('Could not create new asset resource', error);
      }
    }
    try {
      debug(`Creating new asset version for asset with sid ${newAsset.sid}`);
      assetVersion = await createAssetVersion(newAsset, serviceSid, client, {});
    } catch (error) {
      handleError(
        `Could not create new asset version with path: ${newAsset.path}`,
        error
      );
    }
    assetVersions.push(assetVersion.sid);
    if (environment.build_sid) {
      debug(
        `Getting existing asset versions from build with sid ${environment.build_sid}`
      );
      try {
        const lastBuild = await getBuild(
          environment.build_sid,
          serviceSid,
          client
        );
        lastBuild.asset_versions
          .filter(av => av.asset_sid !== assetVersion.asset_sid)
          .forEach(assetVersion => assetVersions.push(assetVersion.sid));
      } catch (error) {
        handleError(
          couldNotGetBuild(environment.build_sid, environmentSid, serviceSid)
        );
      }
    }
    try {
      debug(`Triggering new build for ${assetVersions.length} asset versions`);
      build = await triggerBuild(
        { assetVersions: assetVersions },
        serviceSid,
        client
      );
    } catch (error) {
      handleError('Could not create a new build', error);
    }
    try {
      const updateHandler = new EventEmitter();
      updateHandler.on('status-update', update => debug(update.message));
      await waitForSuccessfulBuild(
        build.sid,
        serviceSid,
        client,
        updateHandler
      );
    } catch (error) {
      handleError('Error while waiting for the build to complete', error);
    }
    try {
      debug(`Activating build with sid ${build.sid}`);
      await activateBuild(build.sid, environment.sid, serviceSid, client);
      spinner.stop();
      assetVersion.url = `https://${environment.domain_name}${assetVersion.path}`;
      return assetVersion;
    } catch (error) {
      handleError('Could not activate build', error);
    }
  } else {
    handleError(
      'No Service Sid or Environment Sid provided. Make sure you run `twilio assets:init` before trying to upload your first asset'
    );
  }
}

module.exports = { upload };
