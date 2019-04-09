import debug from 'debug';
import events from 'events';
import got from 'got';
import path from 'path';
import querystring from 'querystring';
import { PackageJson } from 'type-fest';
import { FileInfo, getDirContent, readFile } from './fs';
import {
  BuildResource,
  EnvironmentList,
  EnvironmentResource,
  FunctionApiResource,
  FunctionList,
  ServiceResource,
  VersionResource,
} from './serverless-api-types';

const log = debug('twilio-labs/serverless-api');

type Config = {
  cwd: string;
  envPath: string;
  accountSid: string;
  authToken: string;
  env: { [key: string]: string | number | undefined };
  serviceSid?: string;
  pkgJson: PackageJson;
  projectName: string;
  functionsEnv: string;
};

type GotClient = typeof got;

interface RawFunctionWithPath extends FileInfo {
  functionPath: string;
}

interface FunctionResource extends RawFunctionWithPath {
  sid: string;
}

type Dependency = {
  name: string;
  version: string;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getClient(config: Config): GotClient {
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
  { projectName }: Config,
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

async function createFunctionResource(
  name: string,
  serviceSid: string,
  client: GotClient
) {
  try {
    const resp = await client.post(`/Services/${serviceSid}/Functions`, {
      form: true,
      body: {
        FriendlyName: name,
      },
    });
    return (resp.body as unknown) as FunctionApiResource;
  } catch (err) {
    throw new Error(`Failed to create "${name}" function`);
  }
}

async function getFunctionResources(serviceSid: string, client: GotClient) {
  const resp = await client.get(`/Services/${serviceSid}/Functions`);
  const content = (resp.body as unknown) as FunctionList;
  return content.functions;
}

async function getOrCreateFunctionResources(
  functions: FileInfo[],
  serviceSid: string,
  client: GotClient
): Promise<FunctionResource[]> {
  const output: FunctionResource[] = [];
  const existingFunctions = await getFunctionResources(serviceSid, client);
  const functionsToCreate: RawFunctionWithPath[] = [];

  functions.forEach(fn => {
    const functionPath = `/${path
      .basename(fn.name, '.js')
      .replace(/\s/g, '-')}`;
    const existingFn = existingFunctions.find(f => fn.name === f.friendly_name);
    if (!existingFn) {
      functionsToCreate.push({ ...fn, functionPath });
    } else {
      output.push({
        ...fn,
        functionPath,
        sid: existingFn.sid,
      });
    }
  });

  const createdFunctions = await Promise.all(
    functionsToCreate.map(async fn => {
      const newFunction = await createFunctionResource(
        fn.name,
        serviceSid,
        client
      );
      return {
        ...fn,
        sid: newFunction.sid,
      };
    })
  );

  return [...output, ...createdFunctions];
}

async function createVersion(
  fn: FunctionResource,
  serviceSid: string,
  client: GotClient
) {
  try {
    const resp = await client.post(
      `/Services/${serviceSid}/Functions/${fn.sid}/Versions`,
      {
        form: true,
        body: {
          Path: fn.functionPath,
          Visibility: 'public',
        },
      }
    );

    return (resp.body as unknown) as VersionResource;
  } catch (err) {
    log(err);
    throw new Error('Failed to upload Function');
  }
}

async function uploadToAws(url: string, key: string, content: string | Buffer) {
  const resp = await got.put(url, {
    headers: {
      'x-amz-server-side-encryption': 'aws:kms',
      'x-amz-server-side-encryption-aws-kms-key-id': key,
    },
    body: content,
  });
  return resp.body;
}

async function uploadFunction(
  fn: FunctionResource,
  serviceSid: string,
  client: GotClient
) {
  const content = await readFile(fn.path, 'utf8');
  const version = await createVersion(fn, serviceSid, client);
  const { pre_signed_upload_url: awsData } = version;
  const awsResult = await uploadToAws(awsData.url, awsData.kmsARN, content);
  return version.sid;
}

async function getBuildStatus(
  buildSid: string,
  serviceSid: string,
  client: GotClient
) {
  const resp = await client.get(`/Services/${serviceSid}/Builds/${buildSid}`);
  return (resp.body as unknown) as BuildResource;
}

function getDependencies(pkgJson: PackageJson): Dependency[] {
  const dependencies = pkgJson.dependencies;
  if (!dependencies) {
    return [];
  }

  return Object.keys(dependencies).map(name => {
    const version = dependencies[name];
    if (!dependencies[name]) {
      return {
        name,
        version: '*',
      };
    }

    return {
      name,
      version: dependencies[name],
    };
  });
}

async function triggerBuild(
  functionVersionSids: string[],
  dependencies: Dependency[],
  serviceSid: string,
  client: GotClient
) {
  try {
    const dependencyString = `"${JSON.stringify(dependencies)}"`;
    const resp = await client.post(`/Services/${serviceSid}/Builds`, {
      // @ts-ignore
      json: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify({
        FunctionVersions: functionVersionSids,
        Dependencies: dependencyString,
      }),
    });
    return JSON.parse(resp.body);
  } catch (err) {
    console.error(err);
  }
}

function waitForSuccessfulBuild(
  buildSid: string,
  serviceSid: string,
  client: GotClient,
  eventEmitter: events.EventEmitter
) {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    let isBuilt = false;

    while (!isBuilt) {
      if (Date.now() - startTime > 120000) {
        if (eventEmitter) {
          eventEmitter.emit('status-update', {
            status: DeployStatus.TIMED_OUT,
            message: 'Deployment took too long',
          });
        }
        reject(new Error('Timeout'));
      }
      const { status } = await getBuildStatus(buildSid, serviceSid, client);
      isBuilt = status === 'VERIFIED';
      if (isBuilt) {
        break;
      }
      if (eventEmitter) {
        eventEmitter.emit('status-update', {
          status: DeployStatus.BUILDING,
          message: `Waiting for deployment. Current status: ${status}`,
        });
      }
      await sleep(1000);
    }
    resolve();
  });
}

async function activateDeployment(
  buildSid: string,
  environmentSid: string,
  serviceSid: string,
  client: GotClient
) {
  const resp = await client.post(
    `/Services/${serviceSid}/Environments/${environmentSid}/Deployments`,
    {
      form: true,
      body: {
        BuildSid: buildSid,
      },
    }
  );
  return resp.body;
}

export const DeployStatus = {
  CREATING_SERVICE: 'creating-service',
  CONFIGURING_ENVIRONMENT: 'configuring-environment',
  READING_FILESYSTEM: 'reading-filesystem',
  CREATING_FUNCTIONS: 'creating-functions',
  UPLOADING_FUNCTIONS: 'uploading-functions',
  BUILDING: 'building',
  TIMED_OUT: 'timed-out',
  ACTIVATING_DEPLOYMENT: 'activating-deployment',
  DONE: 'done',
};

export class TwilioServerlessApiClient extends events.EventEmitter {
  private config: Config;

  constructor(config: Config) {
    super();
    this.config = config;
    this.deployLocalProject = this.deployLocalProject.bind(this);
  }

  async deployLocalProject() {
    const client = getClient(this.config);
    let serviceSid = this.config.serviceSid;
    if (!serviceSid) {
      this.emit('status-update', {
        status: DeployStatus.CREATING_SERVICE,
        message: 'Creating Service',
      });
      serviceSid = await createService(this.config, client);
    }

    this.emit('status-update', {
      status: DeployStatus.CONFIGURING_ENVIRONMENT,
      message: `Configuring "${this.config.functionsEnv}" environment`,
    });
    const environment = await getOrCreateEnvironment(
      this.config.functionsEnv,
      serviceSid,
      client
    );
    const { sid: environmentSid, domain_name: domain } = environment;

    this.emit('status-update', {
      status: DeployStatus.READING_FILESYSTEM,
      message: 'Gathering Functions and Assets to deploy',
    });
    const { functions, assets } = await getListOfFunctionsAndAssets(
      this.config.cwd
    );

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
    const dependencies = getDependencies(this.config.pkgJson);
    const build = await triggerBuild(
      versions,
      dependencies,
      serviceSid,
      client
    );
    await waitForSuccessfulBuild(build.sid, serviceSid, client, this);

    this.emit('status-update', {
      status: DeployStatus.ACTIVATING_DEPLOYMENT,
      message: 'Activating deployment',
    });
    await activateDeployment(build.sid, environmentSid, serviceSid, client);

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
