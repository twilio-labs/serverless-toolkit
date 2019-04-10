import events from 'events';
import got from 'got';
import path from 'path';
import { DeployStatus } from './consts';
import { getOrCreateAssetResources, uploadAsset } from './internals/assets';
import {
  activateBuild,
  triggerBuild,
  waitForSuccessfulBuild,
} from './internals/builds';
import { getDependencies } from './internals/dependencies';
import {
  getOrCreateFunctionResources,
  uploadFunction,
} from './internals/functions';
import { setEnvironmentVariables } from './internals/variables';
import {
  EnvironmentList,
  EnvironmentResource,
  ServiceResource,
} from './serverless-api-types';
import {
  ClientConfig,
  DeployLocalProjectConfig,
  DeployProjectConfig,
  GotClient,
} from './types';
import { getDirContent } from './utils/fs';

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

async function createService(
  projectName: string,
  client: GotClient
): Promise<string> {
  try {
    const resp = await client.post('/Services', {
      form: true,
      body: {
        UniqueName: projectName,
        FriendlyName: projectName,
        IncludeCrendentials: true,
      },
    });
    const service = (resp.body as unknown) as ServiceResource;

    return service.sid;
  } catch (err) {
    throw new Error(`Failed to create service with name ${projectName}`);
  }
}

async function getOrCreateEnvironment(
  envSuffix: string,
  serviceSid: string,
  client: GotClient
) {
  const uniqueName = envSuffix + '-environment';
  try {
    const resp = await client.post(`/Services/${serviceSid}/Environments`, {
      form: true,
      body: {
        UniqueName: uniqueName,
        DomainSuffix: envSuffix,
      },
    });
    return (resp.body as unknown) as EnvironmentResource;
  } catch (err) {
    const resp = await client.get(`/Services/${serviceSid}/Environments`);
    const content = (resp.body as unknown) as EnvironmentList;
    const env = content.environments.find(e => e.unique_name === uniqueName);
    if (!env) {
      throw new Error('Failed to create environment');
    }
    return env;
  }
}

async function getListOfFunctionsAndAssets(cwd: string) {
  const functionsDir = path.join(cwd, 'functions');
  const assetsDir = path.join(cwd, 'assets');

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

  async deployProject(deployConfig: DeployProjectConfig) {
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
      serviceSid = await createService(config.projectName, this.client);
    }

    this.emit('status-update', {
      status: DeployStatus.CONFIGURING_ENVIRONMENT,
      message: `Configuring "${config.functionsEnv}" environment`,
    });
    const environment = await getOrCreateEnvironment(
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
    };
  }

  async deployLocalProject(deployConfig: DeployLocalProjectConfig) {
    this.emit('status-update', {
      status: DeployStatus.READING_FILESYSTEM,
      message: 'Gathering Functions and Assets to deploy',
    });

    console.log(deployConfig);
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
