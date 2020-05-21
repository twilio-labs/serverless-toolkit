/** @module @twilio-labs/serverless-api/dist/api */

import debug from 'debug';
import FormData from 'form-data';
import {
  FunctionApiResource,
  FunctionList,
  FunctionResource,
  ServerlessResourceConfig,
  Sid,
  VersionResource,
  ClientConfig,
} from '../types';
import { TwilioServerlessApiClient } from '../client';
import { getContentType } from '../utils/content-type';
import { ClientApiError } from '../utils/error';
import { getApiUrl } from './utils/api-client';
import { getPaginatedResource } from './utils/pagination';

const log = debug('twilio-serverless-api:functions');

/**
 * Creates a new Function instance by calling the API
 *
 * @param {string} name the friendly name of the function to create
 * @param {string} serviceSid the service the function should belong to
 * @param {TwilioServerlessApiClient} client API client
 * @returns {Promise<FunctionApiResource>}
 */
export async function createFunctionResource(
  name: string,
  serviceSid: string,
  client: TwilioServerlessApiClient
): Promise<FunctionApiResource> {
  try {
    const resp = await client.request(
      'post',
      `Services/${serviceSid}/Functions`,
      {
        form: {
          FriendlyName: name,
        },
      }
    );
    return (resp.body as unknown) as FunctionApiResource;
  } catch (err) {
    log('%O', new ClientApiError(err));
    throw new Error(`Failed to create "${name}" function`);
  }
}

/**
 * Lists all functions associated to a service
 *
 * @export
 * @param {string} serviceSid the service to look up
 * @param {TwilioServerlessApiClient} client API client
 * @returns
 */
export async function listFunctionResources(
  serviceSid: string,
  client: TwilioServerlessApiClient
) {
  try {
    return getPaginatedResource<FunctionList, FunctionApiResource>(
      client,
      `Services/${serviceSid}/Functions`
    );
  } catch (err) {
    log('%O', new ClientApiError(err));
    throw err;
  }
}

/**
 * Given a list of functions it will create the ones that don't exist and retrieves the others
 *
 * @export
 * @param {FileInfo[]} functions list of functions to get or create
 * @param {string} serviceSid service the functions belong to
 * @param {TwilioServerlessApiClient} client API client
 * @returns {Promise<FunctionResource[]>}
 */
export async function getOrCreateFunctionResources(
  functions: ServerlessResourceConfig[],
  serviceSid: string,
  client: TwilioServerlessApiClient
): Promise<FunctionResource[]> {
  const output: FunctionResource[] = [];
  const existingFunctions = await listFunctionResources(serviceSid, client);
  const functionsToCreate: ServerlessResourceConfig[] = [];

  functions.forEach((fn) => {
    const existingFn = existingFunctions.find(
      (f) => fn.name === f.friendly_name
    );
    if (!existingFn) {
      functionsToCreate.push({ ...fn });
    } else {
      output.push({
        ...fn,
        sid: existingFn.sid,
      });
    }
  });

  const createdFunctions = await Promise.all(
    functionsToCreate.map(async (fn) => {
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

/**
 * Creates a new Version to be used for uploading a new function
 *
 * @param {FunctionResource} fn the function the version should be created for
 * @param {string} serviceSid the service related to the function
 * @param {TwilioServerlessApiClient} client API client
 * @returns {Promise<VersionResource>}
 */
async function createFunctionVersion(
  fn: FunctionResource,
  serviceSid: string,
  client: TwilioServerlessApiClient,
  clientConfig: ClientConfig
): Promise<VersionResource> {
  try {
    const contentType =
      (await getContentType(fn.content, fn.filePath || 'application/json')) ||
      'application/javascript';
    log('Uploading asset via form data with content-type "%s"', contentType);

    const contentOpts = {
      filename: fn.name,
      contentType: contentType,
    };

    const form = new FormData();
    form.append('Path', fn.path);
    form.append('Visibility', fn.access);
    form.append('Content', fn.content, contentOpts);

    const resp = await client.request(
      'post',
      `Services/${serviceSid}/Functions/${fn.sid}/Versions`,
      {
        responseType: 'text',
        prefixUrl: getApiUrl(clientConfig, 'serverless-upload'),
        body: form,
      }
    );

    return JSON.parse(resp.body) as VersionResource;
  } catch (err) {
    log('%O', new ClientApiError(err));
    throw new Error(`Failed to upload Function ${fn.name}`);
  }
}

/**
 * Uploads a given function by creating a new version, reading the content if necessary and uploading the content
 *
 * @export
 * @param {FunctionResource} fn function to be uploaded
 * @param {string} serviceSid service that the function is connected to
 * @param {TwilioServerlessApiClient} client API client
 * @returns {Promise<Sid>}
 */
export async function uploadFunction(
  fn: FunctionResource,
  serviceSid: string,
  client: TwilioServerlessApiClient,
  clientConfig: ClientConfig
): Promise<Sid> {
  const version = await createFunctionVersion(
    fn,
    serviceSid,
    client,
    clientConfig
  );
  return version.sid;
}

/**
 * Checks if a string is an function SID by checking its prefix and length
 *
 * @export
 * @param {string} str the string to check
 * @returns
 */
export function isFunctionSid(str: string) {
  return str.startsWith('ZH') && str.length === 34;
}
