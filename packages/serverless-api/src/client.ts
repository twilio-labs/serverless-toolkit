import events from 'events';
import got from 'got';
import path from 'path';
import { DeployStatus } from './consts';
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
import { ClientConfig, DeployLocalProjectConfig, GotClient } from './types';
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

  constructor(config: ClientConfig) {
    super();
    this.config = config;
    this.deployLocalProject = this.deployLocalProject.bind(this);
  }

  async deployLocalProject(deployConfig: DeployLocalProjectConfig) {
    const config = {
      ...this.config,
      ...deployConfig,
    };

    const client = getClient(this.config);
    let serviceSid = config.serviceSid;
    if (!serviceSid) {
      this.emit('status-update', {
        status: DeployStatus.CREATING_SERVICE,
        message: 'Creating Service',
      });
      serviceSid = await createService(config.projectName, client);
    }

    this.emit('status-update', {
      status: DeployStatus.CONFIGURING_ENVIRONMENT,
      message: `Configuring "${config.functionsEnv}" environment`,
    });
    const environment = await getOrCreateEnvironment(
      config.functionsEnv,
      serviceSid,
      client
    );
    const { sid: environmentSid, domain_name: domain } = environment;

    this.emit('status-update', {
      status: DeployStatus.READING_FILESYSTEM,
      message: 'Gathering Functions and Assets to deploy',
    });
    const { functions, assets } = await getListOfFunctionsAndAssets(config.cwd);

    this.emit('status-update', {
      status: DeployStatus.CREATING_FUNCTIONS,
      message: `Creating ${functions.length} Functions`,
    });
    const functionResources = await getOrCreateFunctionResources(
      functions,
      serviceSid,
      client
    );

    this.emit('status-update', {
      status: DeployStatus.UPLOADING_FUNCTIONS,
      message: `Uploading ${functions.length} Functions`,
    });
    const versions = await Promise.all(
      functionResources.map(fn => {
        return uploadFunction(fn, serviceSid as string, client);
      })
    );

    this.emit('status-update', {
      status: DeployStatus.BUILDING,
      message: 'Waiting for deployment.',
    });
    const dependencies = getDependencies(config.pkgJson);
    const build = await triggerBuild(
      versions,
      dependencies,
      serviceSid,
      client
    );
    await waitForSuccessfulBuild(build.sid, serviceSid, client, this);

    this.emit('status-update', {
      status: DeployStatus.SETTING_VARIABLES,
      message: 'Setting environment variables',
    });
    await setEnvironmentVariables(
      config.env,
      environmentSid,
      serviceSid,
      client
    );

    this.emit('status-update', {
      status: DeployStatus.ACTIVATING_DEPLOYMENT,
      message: 'Activating deployment',
    });
    await activateBuild(build.sid, environmentSid, serviceSid, client);

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
}

export default TwilioServerlessApiClient;
