const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
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
const { resolve, basename } = require('path');
const { readFile } = require('fs/promises');
const EventEmitter = require('events');
const { ConfigStore } = require('../../configStore');
const ora = require('ora');
const inquirer = require('inquirer');
const { createErrorHandler } = require('../../errors');
const debug = require('debug')('twilio:assets:upload');
const spinner = ora();
const handleError = createErrorHandler(debug, spinner);

class UploadCommand extends TwilioClientCommand {
  async run() {
    await super.run();
    let environment,
      lastBuild,
      build,
      assetContent,
      filePath,
      existingAssets,
      assetVersion,
      assetVersions = [];
    const { args } = this.parse(UploadCommand);
    spinner.start('Loading config');
    const configStore = new ConfigStore(this.config.configDir);
    const config = await configStore.load();
    const { accountSid } = this.currentProfile;
    if (config[accountSid]?.serviceSid && config[accountSid]?.environmentSid) {
      const { serviceSid, environmentSid } = config[accountSid];
      const client = new TwilioServerlessApiClient({
        username: this.currentProfile.apiKey,
        password: this.currentProfile.apiSecret,
      });
      spinner.text = 'Checking assets service';
      try {
        environment = await getEnvironment(environmentSid, serviceSid, client);
      } catch (error) {
        handleError(error, 'Could not fetch asset service environment');
        return;
      }
      if (environment.build_sid) {
        try {
          lastBuild = await getBuild(environment.build_sid, serviceSid, client);
          if (lastBuild.function_versions.length > 0) {
            spinner.fail(
              'Not an Asset Plugin service: service contains functions'
            );
            return;
          }
        } catch (error) {
          handleError(
            error,
            'Could not fetch last build of asset service environment'
          );
          return;
        }
      }
      spinner.text = 'Preparing asset';
      try {
        filePath = resolve(args.file);
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
          const newNameAnswers = await inquirer.prompt([
            {
              name: 'newName',
              type: 'input',
              message: 'Enter a new filename:',
            },
          ]);
          newAsset.name = newAsset.path = newNameAnswers.newName;
          spinner.start('Creating new asset resource');
          try {
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
          console.log('Aborting');
          return;
        }
      } else {
        try {
          spinner.start('Creating new asset resource');
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
        spinner.start('Creating new asset version');
        assetVersion = await createAssetVersion(
          newAsset,
          serviceSid,
          client,
          {}
        );
      } catch (error) {
        handleError(error, 'Could not create new asset version');
        return;
      }
      assetVersions.push(assetVersion.sid);
      if (lastBuild) {
        lastBuild.asset_versions
          .filter(av => av.asset_sid !== assetVersion.asset_sid)
          .forEach(assetVersion => assetVersions.push(assetVersion.sid));
      }
      try {
        spinner.text = 'Creating new build';
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
        spinner.text = 'Waiting for deployment. Current status:';
        const updateHandler = new EventEmitter();
        updateHandler.on('status-update', update => {
          spinner.text = update.message;
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
        spinner.text = 'Activating build';
        await activateBuild(build.sid, environment.sid, serviceSid, client);
        spinner.succeed('Build complete');
        build.asset_versions.forEach(assetVersion => {
          console.log(`https://${environment.domain_name}${assetVersion.path}`);
        });
      } catch (error) {
        handleError(error, 'Could not activate build');
        return;
      }
    } else {
      spinner.fail(
        'No Service Sid or Environment Sid provided. Make sure you run twilio assets:init before uploading your first asset'
      );
    }
  }
}

UploadCommand.args = [
  {
    name: 'file',
    required: true,
    description: 'The path to the file you want to upload',
  },
];

UploadCommand.flags = { profile: TwilioClientCommand.flags.profile };

module.exports = UploadCommand;
