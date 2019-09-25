/** @module @twilio-labs/serverless-api/dist/api */

import debug from 'debug';
import querystring from 'querystring';
import { JsonObject } from 'type-fest';
import {
  BuildConfig,
  BuildList,
  BuildResource,
  BuildStatus,
  GotClient,
} from '../types';
import { DeployStatus } from '../types/consts';
import { sleep } from '../utils/sleep';
import { getPaginatedResource } from './utils/pagination';

import events = require('events');

const log = debug('twilio-serverless-api:builds');

/**
 * Retrieves a specific build by its SID
 *
 * @export
 * @param {string} buildSid SID of build to retrieve
 * @param {string} serviceSid service to retrieve build from
 * @param {GotClient} client API client
 * @returns {Promise<BuildResource>}
 */
export async function getBuild(
  buildSid: string,
  serviceSid: string,
  client: GotClient
): Promise<BuildResource> {
  const resp = await client.get(`/Services/${serviceSid}/Builds/${buildSid}`);
  return (resp.body as unknown) as BuildResource;
}

/**
 * Returns the current status of a build given its SID
 *
 * @param {string} buildSid the SID of the build
 * @param {string} serviceSid the SID of the service the build belongs to
 * @param {GotClient} client API client
 * @returns {Promise<BuildStatus>}
 */
async function getBuildStatus(
  buildSid: string,
  serviceSid: string,
  client: GotClient
): Promise<BuildStatus> {
  try {
    const resp = await getBuild(buildSid, serviceSid, client);
    return resp.status;
  } catch (err) {
    log('%O', err);
    throw err;
  }
}

/**
 * Returns a list of all builds related to service
 *
 * @export
 * @param {string} serviceSid the SID of the service
 * @param {GotClient} client API client
 * @returns {Promise<BuildResource[]>}
 */
export async function listBuilds(
  serviceSid: string,
  client: GotClient
): Promise<BuildResource[]> {
  return getPaginatedResource<BuildList, BuildResource>(
    client,
    `/Services/${serviceSid}/Builds`
  );
}

/**
 * Triggers a new build by creating it
 *
 * @export
 * @param {BuildConfig} config build-related information (functions, assets, dependencies)
 * @param {string} serviceSid the service to create the build for
 * @param {GotClient} client API client
 * @returns {Promise<BuildResource>}
 */
export async function triggerBuild(
  config: BuildConfig,
  serviceSid: string,
  client: GotClient
): Promise<BuildResource> {
  const { functionVersions, dependencies, assetVersions } = config;
  try {
    const body: JsonObject = {};

    if (Array.isArray(dependencies) && dependencies.length > 0) {
      const dependencyString = `"${JSON.stringify(dependencies)}"`;
      body.Dependencies = dependencyString;
    }

    if (Array.isArray(functionVersions) && functionVersions.length > 0) {
      body.FunctionVersions = functionVersions;
    }

    if (Array.isArray(assetVersions) && assetVersions.length > 0) {
      body.AssetVersions = assetVersions;
    }

    const resp = await client.post(`/Services/${serviceSid}/Builds`, {
      // @ts-ignore
      json: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify(body),
    });
    return JSON.parse(resp.body) as BuildResource;
  } catch (err) {
    log('%O', err);
    throw err;
  }
}

/**
 * Resolves only when build has been completed. Will timeout after specified time.
 *
 * @export
 * @param {string} buildSid the build to wait for
 * @param {string} serviceSid the service of the build
 * @param {GotClient} client API client
 * @param {events.EventEmitter} eventEmitter optional event emitter to communicate current build status
 * @param {number} timeout optional timeout. default: 5 minutes
 * @returns {Promise<void>}
 */
export function waitForSuccessfulBuild(
  buildSid: string,
  serviceSid: string,
  client: GotClient,
  eventEmitter: events.EventEmitter,
  timeout: number = 5 * 60 * 1000
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    let isBuilt = false;

    while (!isBuilt) {
      if (Date.now() - startTime > timeout) {
        if (eventEmitter) {
          eventEmitter.emit('status-update', {
            status: DeployStatus.TIMED_OUT,
            message: 'Deployment took too long',
          });
        }
        reject(new Error('Timeout'));
      }
      const status = await getBuildStatus(buildSid, serviceSid, client);
      isBuilt = status === 'completed';
      if (isBuilt) {
        break;
      }

      const hasFailed = status === 'failed';
      if (hasFailed) {
        reject(status);
        return;
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

/**
 * Activates a specific build for a given environment by creating a new deployment
 *
 * @export
 * @param {string} buildSid the build to be activated
 * @param {string} environmentSid the target environment for the build to be deployed to
 * @param {string} serviceSid the service of the project
 * @param {GotClient} client API client
 * @returns {Promise<any>}
 */
export async function activateBuild(
  buildSid: string,
  environmentSid: string,
  serviceSid: string,
  client: GotClient
): Promise<any> {
  try {
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
  } catch (err) {
    log('%O', err);
    throw err;
  }
}
