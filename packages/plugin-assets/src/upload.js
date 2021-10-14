const ora = require('ora');
const inquirer = require('inquirer');
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

const {
  couldNotGetEnvironment,
  couldNotGetBuild,
  debugFlagMessage,
} = require('./errorMessages');

const { getTwilioClient } = require('./client');

function getUtils(spinner, logger) {
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

  async function getEnvironmentWithClient(
    client,
    environmentSid,
    serviceSid,
    accountSid
  ) {
    spinner.text = 'Checking assets service';
    try {
      debug(
        `Fetching environment with sid ${environmentSid} from service with sid ${serviceSid}`
      );
      return await getEnvironment(environmentSid, serviceSid, client);
    } catch (error) {
      handleError(
        couldNotGetEnvironment(accountSid, serviceSid, environmentSid),
        error
      );
    }
  }

  async function checkServiceForFunctions(client, serviceSid) {
    try {
      debug(`Checking for functions in service with sid ${serviceSid}`);
      const functions = await listFunctionResources(serviceSid, client);
      if (functions.length > 0) {
        handleError('Not an Asset Plugin service: service contains functions');
      }
    } catch (error) {
      handleError(
        `Could not fetch last build of asset service environment

${debugFlagMessage}`,
        error
      );
    }
  }

  async function prepareAsset(file, options = {}) {
    let filePath;
    spinner.text = 'Preparing asset';
    try {
      filePath = resolve(file);
      debug(`Reading file from ${filePath}`);
      const assetContent = await readFile(filePath);
      const path = `${encodeURIComponent(basename(filePath))}`;
      const access = options.access || 'public';
      const newAsset = {
        content: assetContent,
        name: path,
        path,
        access,
      };
      return newAsset;
    } catch (error) {
      handleError(`Could not read ${filePath}`, error);
    }
  }

  async function getExistingAssets(client, serviceSid) {
    try {
      debug('Finding existing asset resources');
      return await listAssetResources(serviceSid, client);
    } catch (error) {
      handleError(
        `Could not load existing asset resources from service ${serviceSid}

${debugFlagMessage}`,
        error
      );
    }
  }

  async function overwriteRenameOrAbort(
    existingAsset,
    existingAssets,
    newAsset,
    client,
    serviceSid
  ) {
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
      spinner.start('Overwriting existing asset');
      return { ...newAsset, sid: existingAsset.sid };
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
        existingAssets.find((asset) => asset.friendly_name === newName) ||
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
      let asset = { ...newAsset, name: newName, path: newName };
      return await createNewAssetResource(asset, serviceSid, client);
    } else if (answers.conflict === 'Abort') {
      handleError('Upload cancelled');
    }
  }

  async function createNewAssetResource(asset, serviceSid, client) {
    try {
      spinner.start('Creating new asset');
      debug(`Creating new asset resource called ${asset.name}`);
      const assetResource = await createAssetResource(
        asset.name,
        serviceSid,
        client
      );
      return { ...asset, sid: assetResource.sid };
    } catch (error) {
      handleError(
        `Could not create new asset resource

${debugFlagMessage}`,
        error
      );
    }
  }

  async function createNewAssetVersion(asset, serviceSid, client) {
    try {
      debug(`Creating new asset version for asset with sid ${asset.sid}`);
      return await createAssetVersion(asset, serviceSid, client, {});
    } catch (error) {
      handleError(
        `Could not create new asset version with path: ${asset.path}

${debugFlagMessage}`,
        error
      );
    }
  }

  async function getExistingAssetVersions(
    buildSid,
    environmentSid,
    serviceSid,
    client
  ) {
    debug(`Getting existing asset versions from build with sid ${buildSid}`);
    try {
      const lastBuild = await getBuild(buildSid, serviceSid, client);
      return lastBuild.asset_versions;
    } catch (error) {
      handleError(
        couldNotGetBuild(environment.build_sid, environmentSid, serviceSid)
      );
    }
  }

  async function triggerNewBuild(assetVersions, serviceSid, client) {
    try {
      debug(`Triggering new build for ${assetVersions.length} asset versions`);
      return await triggerBuild(
        { assetVersions: assetVersions },
        serviceSid,
        client
      );
    } catch (error) {
      handleError(
        `Could not create a new build

${debugFlagMessage}`,
        error
      );
    }
  }

  async function waitForBuild(buildSid, serviceSid, client) {
    try {
      const updateHandler = new EventEmitter();
      updateHandler.on('status-update', (update) => debug(update.message));
      await waitForSuccessfulBuild(buildSid, serviceSid, client, updateHandler);
    } catch (error) {
      handleError(
        `Error while waiting for the build to complete

${debugFlagMessage}`,
        error
      );
    }
  }

  async function activateNewBuild(
    buildSid,
    environmentSid,
    serviceSid,
    client
  ) {
    try {
      debug(`Activating build with sid ${buildSid}`);
      await activateBuild(buildSid, environmentSid, serviceSid, client);
    } catch (error) {
      handleError(
        `Could not activate build

${debugFlagMessage}`,
        error
      );
    }
  }

  return {
    handleError,
    getEnvironmentWithClient,
    checkServiceForFunctions,
    prepareAsset,
    getExistingAssets,
    overwriteRenameOrAbort,
    createNewAssetResource,
    createNewAssetVersion,
    getExistingAssetVersions,
    triggerNewBuild,
    waitForBuild,
    activateNewBuild,
  };
}

async function upload({
  pluginConfig,
  apiKey,
  apiSecret,
  accountSid,
  file,
  logger,
  visibility,
}) {
  const spinner = ora({
    isSilent: logger.config.level > 0,
  });

  const {
    handleError,
    getEnvironmentWithClient,
    checkServiceForFunctions,
    prepareAsset,
    getExistingAssets,
    overwriteRenameOrAbort,
    createNewAssetResource,
    createNewAssetVersion,
    getExistingAssetVersions,
    triggerNewBuild,
    waitForBuild,
    activateNewBuild,
  } = getUtils(spinner, logger);

  spinner.start('Loading config');
  const config = await pluginConfig.getConfig();
  if (
    config[accountSid] &&
    config[accountSid].serviceSid &&
    config[accountSid].environmentSid
  ) {
    const { serviceSid, environmentSid } = config[accountSid];
    const client = getTwilioClient(apiKey, apiSecret);
    const environment = await getEnvironmentWithClient(
      client,
      environmentSid,
      serviceSid,
      accountSid
    );
    await checkServiceForFunctions(client, serviceSid);
    let newAsset = await prepareAsset(file, { access: visibility });
    const existingAssets = await getExistingAssets(client, serviceSid);
    const existingAsset = existingAssets.find(
      (asset) => asset.friendly_name === newAsset.name
    );
    if (existingAsset) {
      newAsset = await overwriteRenameOrAbort(
        existingAsset,
        existingAssets,
        newAsset,
        client,
        serviceSid
      );
    } else {
      newAsset = await createNewAssetResource(newAsset, serviceSid, client);
    }
    const assetVersion = await createNewAssetVersion(
      newAsset,
      serviceSid,
      client
    );
    const assetVersions = [assetVersion.sid];
    if (environment.build_sid) {
      const existingAssetVersions = await getExistingAssetVersions(
        environment.build_sid,
        environmentSid,
        serviceSid,
        client
      );
      existingAssetVersions
        .filter((av) => av.asset_sid !== assetVersion.asset_sid)
        .forEach((assetVersion) => assetVersions.push(assetVersion.sid));
    }
    const build = await triggerNewBuild(
      Array.from(assetVersions),
      serviceSid,
      client
    );
    await waitForBuild(build.sid, serviceSid, client);
    await activateNewBuild(build.sid, environmentSid, serviceSid, client);
    spinner.stop();
    assetVersion.url = `https://${environment.domain_name}${assetVersion.path}`;
    return assetVersion;
  } else {
    handleError(
      'No Service Sid or Environment Sid provided. Make sure you run `twilio assets:init` before trying to upload your first asset'
    );
  }
}

module.exports = { upload };
