/** @module @twilio-labs/serverless-api */

import debug from 'debug';
import events from 'events';
import got from 'got';
import { getOrCreateAssetResources, uploadAsset } from './api/assets';
import {
  activateBuild,
  getBuild,
  listBuilds,
  triggerBuild,
  waitForSuccessfulBuild,
} from './api/builds';
import { getDependencies } from './api/dependencies';
import {
  createEnvironmentFromSuffix,
  createEnvironmentIfNotExists,
  getEnvironment,
  getEnvironmentFromSuffix,
  isEnvironmentSid,
  listEnvironments,
} from './api/environments';
import { getOrCreateFunctionResources, uploadFunction } from './api/functions';
import { createService, findServiceSid, listServices } from './api/services';
import {
  listVariablesForEnvironment,
  setEnvironmentVariables,
} from './api/variables';
import {
  ActivateConfig,
  ActivateResult,
  BuildResource,
  ClientConfig,
  DeployLocalProjectConfig,
  DeployProjectConfig,
  DeployResult,
  GotClient,
  ListConfig,
  ListResult,
} from './types';
import { DeployStatus } from './types/consts';
import { getListOfFunctionsAndAssets, SearchConfig } from './utils/fs';

const log = debug('twilio-serverless-api:client');

function createGotClient(config: ClientConfig): GotClient {
  // @ts-ignore
  const client = got.extend({
    baseUrl: 'https://serverless.twilio.com/v1',
    json: true,
    auth: `${config.accountSid}:${config.authToken}`,
    headers: {
      'User-Agent': 'twilio-serverless-api',
    },
  });
  return client;
}

export class TwilioServerlessApiClient extends events.EventEmitter {
  /**
   * Contains the client config used to do API requests
   *
   * @private
   * @type {ClientConfig}
   * @memberof TwilioServerlessApiClient
   */
  private config: ClientConfig;

  /**
   * The `got` client that is used to make all the API requests
   *
   * @private
   * @type {GotClient}
   * @memberof TwilioServerlessApiClient
   */
  private client: GotClient;

  constructor(config: ClientConfig) {
    debug.enable(process.env.DEBUG || '');
    super();
    this.config = config;
    this.client = createGotClient(config);
  }

  /**
   * Returns the internally used GotClient instance used to make API requests
   * @returns {GotClient} A client instance with set-up credentials
   */
  getClient(): GotClient {
    debug.enable(process.env.DEBUG || '');
    return this.client;
  }

  /**
   * Returns an object containing lists of services, environments, variables
   * functions or assets, depending on which have beeen requested in `listConfig`
   * @param  {ListConfig} listConfig Specifies info around which things should be listed
   * @returns Promise<ListResult> Object containing the different lists.
   */
  async list(listConfig: ListConfig): Promise<ListResult> {
    let {
      types,
      serviceSid,
      serviceName: serviceName,
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
      typeof serviceName !== 'undefined'
    ) {
      serviceSid = await findServiceSid(serviceName, this.client);
    }

    if (typeof serviceSid === 'undefined') {
      throw new Error('Missing service SID argument');
    }

    const result: ListResult = {};

    let currentBuildSidForEnv: string | undefined;
    let currentBuild: BuildResource | undefined;
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
            const environment = await getEnvironmentFromSuffix(
              environmentSid,
              serviceSid,
              this.client
            );
            environmentSid = environment.sid;
            currentBuildSidForEnv = environment.build_sid;
          } else if (!currentBuildSidForEnv) {
            const environment = await getEnvironment(
              environmentSid,
              serviceSid,
              this.client
            );
            currentBuildSidForEnv = environment.build_sid;
          }

          if (type === 'functions' || type === 'assets') {
            if (!currentBuild) {
              currentBuild = await getBuild(
                currentBuildSidForEnv,
                serviceSid,
                this.client
              );
            }

            if (type === 'functions') {
              result.functions = {
                environmentSid,
                entries: currentBuild.function_versions,
              };
            } else if (type === 'assets') {
              result.assets = {
                environmentSid,
                entries: currentBuild.asset_versions,
              };
            }
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

  /**
   * "Activates" a build by taking a specified build SID or a "source environment"
   * and activating the same build in the specified `environment`.
   *
   * Can optionally create the new environment when called with `activateConfig.createEnvironment`
   * @param  {ActivateConfig} activateConfig Config to specify which build to activate in which environment
   * @returns Promise<ActivateResult> Object containing meta information around deployment
   */
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
        const environment = await getEnvironmentFromSuffix(
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
        } else {
          throw err;
        }
      }
    }

    if (!buildSid && sourceEnvironment) {
      let currentEnv;
      if (!isEnvironmentSid(sourceEnvironment)) {
        currentEnv = await getEnvironmentFromSuffix(
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

    const { domain_name } = await getEnvironment(
      targetEnvironment,
      serviceSid,
      this.client
    );
    await activateBuild(buildSid, targetEnvironment, serviceSid, this.client);

    return {
      serviceSid,
      buildSid,
      environmentSid: targetEnvironment,
      domain: domain_name,
    };
  }

  /**
   * Deploys a set of functions, assets, variables and dependencies specified
   * in `deployConfig`. Functions & assets can either be paths to the local
   * filesystem or `Buffer` instances allowing you to dynamically upload
   * even without a file system.
   *
   * Unless a `deployConfig. serviceSid` is specified, it will try to create one. If a service
   * with the name `deployConfig.serviceName` already exists, it will throw
   * an error. You can make it use the existing service by setting `overrideExistingService` to
   * true.
   *
   * Updates to the deployment will be emitted as events to `status-update`. Example:
   *
   * ```js
   * client.on('status-update', ({ status, message }) => {
   *  console.log('[%s]: %s', status, message);
   * })
   * ```
   * @param  {DeployProjectConfig} deployConfig Config containing all details for deployment
   * @returns Promise<DeployResult> Object containing meta information around deployment
   */
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
        serviceSid = await createService(config.serviceName, this.client);
      } catch (err) {
        const alternativeServiceSid = await findServiceSid(
          config.serviceName,
          this.client
        );
        if (!alternativeServiceSid) {
          throw err;
        }
        if (config.overrideExistingService || config.force) {
          serviceSid = alternativeServiceSid;
        } else {
          const error = new Error(
            `Service with name "${config.serviceName}" already exists with SID "${alternativeServiceSid}".`
          );
          error.name = 'conflicting-servicename';
          Object.defineProperty(error, 'serviceSid', {
            value: alternativeServiceSid,
          });
          Object.defineProperty(error, 'serviceName', {
            value: config.serviceName,
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

  /**
   * Deploys a local project by reading existing functions and assets
   * from `deployConfig.cwd` and calling `this.deployProject` with it.
   *
   * Functions have to be placed in a `functions` or `src` directory to be found.
   * Assets have to be placed into an `assets` or `static` directory.
   *
   * Nested folder structures will result in nested routes.
   * @param  {DeployLocalProjectConfig} deployConfig
   * @returns Promise<DeployResult> Object containing meta information around deployment
   */
  async deployLocalProject(
    deployConfig: DeployLocalProjectConfig
  ): Promise<DeployResult> {
    this.emit('status-update', {
      status: DeployStatus.READING_FILESYSTEM,
      message: 'Gathering Functions and Assets to deploy',
    });

    log('Deploy config %P', deployConfig);

    const searchConfig: SearchConfig = {};
    if (deployConfig.functionsFolderName) {
      searchConfig.functionsFolderNames = [deployConfig.functionsFolderName];
    }

    if (deployConfig.assetsFolderName) {
      searchConfig.assetsFolderNames = [deployConfig.assetsFolderName];
    }

    let { functions, assets } = await getListOfFunctionsAndAssets(
      deployConfig.cwd,
      searchConfig
    );

    if (deployConfig.noFunctions) {
      log('Disabling functions upload by emptying functions array');
      functions = [];
    }

    if (deployConfig.noAssets) {
      log('Disabling assets upload by emptying assets array');
      assets = [];
    }

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
