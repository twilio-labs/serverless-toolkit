import debug from 'debug';
import events from 'events';
import got from 'got';
import { DeployStatus } from './consts';
import { getOrCreateAssetResources, uploadAsset } from './internals/assets';
import {
  activateBuild,
  listBuilds,
  triggerBuild,
  waitForSuccessfulBuild,
} from './internals/builds';
import { getDependencies } from './internals/dependencies';
import {
  createEnvironmentFromSuffix,
  createEnvironmentIfNotExists,
  getEnvironment,
  getEnvironmnetFromSuffix,
  isEnvironmentSid,
  listEnvironments,
} from './internals/environments';
import {
  getOrCreateFunctionResources,
  uploadFunction,
} from './internals/functions';
import {
  createService,
  findServiceSid,
  listServices,
} from './internals/services';
import {
  listVariablesForEnvironment,
  setEnvironmentVariables,
} from './internals/variables';
import {
  ActivateConfig,
  ActivateResult,
  ClientConfig,
  DeployLocalProjectConfig,
  DeployProjectConfig,
  DeployResult,
  GotClient,
  ListConfig,
  ListResult,
} from './types';
import { getDirContent, getFirstMatchingDirectory } from './utils/fs';

const log = debug('twilio-serverless-api:client');

function getClient(config: ClientConfig): GotClient {
  // @ts-ignore
  const client = got.extend({
    baseUrl: 'https://serverless.twilio.com/v1',
    json: true,
    auth: `${config.accountSid}:${config.authToken}`,
    headers: {
      'User-Agent': 'twilio-run',
    },
  });
  return client;
}

async function getListOfFunctionsAndAssets(cwd: string) {
  const functionsDir = await getFirstMatchingDirectory(cwd, [
    'functions',
    'src',
  ]);
  const assetsDir = await getFirstMatchingDirectory(cwd, ['assets', 'static']);

  const functions = await getDirContent(functionsDir, '.js');
  const assets = await getDirContent(assetsDir);
  return { functions, assets };
}

export class TwilioServerlessApiClient extends events.EventEmitter {
  private config: ClientConfig;
  private client: GotClient;

  constructor(config: ClientConfig) {
    super();
    this.config = config;
    this.client = getClient(config);
    this.deployProject = this.deployProject.bind(this);
    this.deployLocalProject = this.deployLocalProject.bind(this);
  }

  getClient(): GotClient {
    return this.client;
  }

  async list(listConfig: ListConfig): Promise<ListResult> {
    let {
      types,
      serviceSid,
      projectName,
      environment: environmentSid,
    } = listConfig;

    if (
      types === 'services' ||
      (types.length === 1 && types[0] === 'services')
    ) {
      const services = await listServices(this.client);
      return { services };
    }

    if (
      typeof serviceSid === 'undefined' &&
      typeof projectName !== 'undefined'
    ) {
      serviceSid = await findServiceSid(projectName, this.client);
    }

    if (typeof serviceSid === 'undefined') {
      throw new Error('Missing service SID argument');
    }

    const result: ListResult = {};

    for (const type of types) {
      try {
        if (type === 'environments') {
          result.environments = await listEnvironments(serviceSid, this.client);
        }

        if (type === 'builds') {
          result.builds = await listBuilds(serviceSid, this.client);
        }

        if (typeof environmentSid === 'string') {
          if (!isEnvironmentSid(environmentSid)) {
            const environment = await getEnvironmnetFromSuffix(
              environmentSid,
              serviceSid,
              this.client
            );
            environmentSid = environment.sid;
          }

          if (type === 'variables') {
            result.variables = {
              entries: await listVariablesForEnvironment(
                environmentSid,
                serviceSid,
                this.client
              ),
              environmentSid,
            };
          }
        }
      } catch (err) {
        log(err);
      }
    }

    return result;
  }

  async activateBuild(activateConfig: ActivateConfig): Promise<ActivateResult> {
    let {
      buildSid,
      targetEnvironment,
      serviceSid,
      sourceEnvironment,
    } = activateConfig;

    if (!buildSid && !sourceEnvironment) {
      const error = new Error(
        'You need to specify either a build SID or source environment to activate'
      );
      error.name = 'activate-missing-source';
      throw error;
    }

    if (!isEnvironmentSid(targetEnvironment)) {
      try {
        const environment = await getEnvironmnetFromSuffix(
          targetEnvironment,
          serviceSid,
          this.client
        );
        targetEnvironment = environment.sid;
      } catch (err) {
        if (activateConfig.force || activateConfig.createEnvironment) {
          const environment = await createEnvironmentFromSuffix(
            targetEnvironment,
            serviceSid,
            this.client
          );
          targetEnvironment = environment.sid;
        }
        throw err;
      }
    }

    if (!buildSid && sourceEnvironment) {
      let currentEnv;
      if (!isEnvironmentSid(sourceEnvironment)) {
        currentEnv = await getEnvironmnetFromSuffix(
          sourceEnvironment,
          serviceSid,
          this.client
        );
      } else {
        currentEnv = await getEnvironment(
          sourceEnvironment,
          serviceSid,
          this.client
        );
      }
      buildSid = currentEnv.build_sid;
    }

    if (!buildSid) {
      throw new Error('Could not determine build SID');
    }

    await activateBuild(buildSid, targetEnvironment, serviceSid, this.client);

    return {
      serviceSid,
      buildSid,
      environmentSid: targetEnvironment,
    };
  }

  async deployProject(
    deployConfig: DeployProjectConfig
  ): Promise<DeployResult> {
    const config = {
      ...this.config,
      ...deployConfig,
    };

    const { functions, assets } = config;

    let serviceSid = config.serviceSid;
    if (!serviceSid) {
      this.emit('status-update', {
        status: DeployStatus.CREATING_SERVICE,
        message: 'Creating Service',
      });
      try {
        serviceSid = await createService(config.projectName, this.client);
      } catch (err) {
        const alternativeServiceSid = await findServiceSid(
          config.projectName,
          this.client
        );
        if (!alternativeServiceSid) {
          throw err;
        }
        if (config.overrideExistingService || config.force) {
          serviceSid = alternativeServiceSid;
        } else {
          const error = new Error(
            `Project with name "${
              config.projectName
            }" already exists with SID "${alternativeServiceSid}".`
          );
          error.name = 'conflicting-servicename';
          Object.defineProperty(err, 'serviceSid', {
            value: alternativeServiceSid,
          });
          Object.defineProperty(err, 'projectName', {
            value: config.projectName,
          });
          throw error;
        }
      }
    }

    this.emit('status-update', {
      status: DeployStatus.CONFIGURING_ENVIRONMENT,
      message: `Configuring "${config.functionsEnv}" environment`,
    });
    const environment = await createEnvironmentIfNotExists(
      config.functionsEnv,
      serviceSid,
      this.client
    );
    const { sid: environmentSid, domain_name: domain } = environment;

    //
    // Functions
    //

    this.emit('status-update', {
      status: DeployStatus.CREATING_FUNCTIONS,
      message: `Creating ${functions.length} Functions`,
    });
    const functionResources = await getOrCreateFunctionResources(
      functions,
      serviceSid,
      this.client
    );

    this.emit('status-update', {
      status: DeployStatus.UPLOADING_FUNCTIONS,
      message: `Uploading ${functions.length} Functions`,
    });
    const functionVersions = await Promise.all(
      functionResources.map(fn => {
        return uploadFunction(fn, serviceSid as string, this.client);
      })
    );

    //
    // Assets
    //

    this.emit('status-update', {
      status: DeployStatus.CREATING_ASSETS,
      message: `Creating ${assets.length} Assets`,
    });
    const assetResources = await getOrCreateAssetResources(
      assets,
      serviceSid,
      this.client
    );

    this.emit('status-update', {
      status: DeployStatus.UPLOADING_ASSETS,
      message: `Uploading ${assets.length} Assets`,
    });
    const assetVersions = await Promise.all(
      assetResources.map(asset => {
        return uploadAsset(asset, serviceSid as string, this.client);
      })
    );

    this.emit('status-update', {
      status: DeployStatus.BUILDING,
      message: 'Waiting for deployment.',
    });
    const dependencies = getDependencies(config.pkgJson);
    const build = await triggerBuild(
      { functionVersions, dependencies, assetVersions },
      serviceSid,
      this.client
    );
    await waitForSuccessfulBuild(build.sid, serviceSid, this.client, this);

    this.emit('status-update', {
      status: DeployStatus.SETTING_VARIABLES,
      message: 'Setting environment variables',
    });
    await setEnvironmentVariables(
      config.env,
      environmentSid,
      serviceSid,
      this.client
    );

    this.emit('status-update', {
      status: DeployStatus.ACTIVATING_DEPLOYMENT,
      message: 'Activating deployment',
    });
    await activateBuild(build.sid, environmentSid, serviceSid, this.client);

    this.emit('status', {
      status: DeployStatus.DONE,
      message: 'Project successfully deployed',
    });
    return {
      serviceSid,
      environmentSid,
      buildSid: build.sid,
      domain,
      functionResources,
      assetResources,
    };
  }

  async deployLocalProject(
    deployConfig: DeployLocalProjectConfig
  ): Promise<DeployResult> {
    this.emit('status-update', {
      status: DeployStatus.READING_FILESYSTEM,
      message: 'Gathering Functions and Assets to deploy',
    });

    const { functions, assets } = await getListOfFunctionsAndAssets(
      deployConfig.cwd
    );

    const config = {
      ...this.config,
      ...deployConfig,
      functions,
      assets,
    };

    return this.deployProject(config);
  }
}

export default TwilioServerlessApiClient;
