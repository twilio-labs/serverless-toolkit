/** @module @twilio-labs/serverless-api/dist/api */

import debug from 'debug';
import { extname } from 'path';
import {
  FileInfo,
  FunctionApiResource,
  FunctionList,
  FunctionResource,
  GotClient,
  RawFunctionWithPath,
  Sid,
  VersionResource,
} from '../types';
import { uploadToAws } from '../utils/aws-upload';
import { getPathAndAccessFromFileInfo, readFile } from '../utils/fs';

const log = debug('twilio-serverless-api:functions');

/**
 * Creates a new Function instance by calling the API
 *
 * @param {string} name the friendly name of the function to create
 * @param {string} serviceSid the service the function should belong to
 * @param {GotClient} client API client
 * @returns {Promise<FunctionApiResource>}
 */
export async function createFunctionResource(
  name: string,
  serviceSid: string,
  client: GotClient
): Promise<FunctionApiResource> {
  try {
    const resp = await client.post(`/Services/${serviceSid}/Functions`, {
      form: true,
      body: {
        FriendlyName: name,
      },
    });
    return (resp.body as unknown) as FunctionApiResource;
  } catch (err) {
    log('%O', err);
    throw new Error(`Failed to create "${name}" function`);
  }
}

/**
 * Lists all functions associated to a service
 *
 * @export
 * @param {string} serviceSid the service to look up
 * @param {GotClient} client API client
 * @returns
 */
export async function listFunctionResources(
  serviceSid: string,
  client: GotClient
) {
  try {
    const resp = await client.get(`/Services/${serviceSid}/Functions`);
    const content = (resp.body as unknown) as FunctionList;
    return content.functions;
  } catch (err) {
    log('%O', err);
    throw err;
  }
}

/**
 * Given a list of functions it will create the ones that don't exist and retrieves the others
 *
 * @export
 * @param {FileInfo[]} functions list of functions to get or create
 * @param {string} serviceSid service the functions belong to
 * @param {GotClient} client API client
 * @returns {Promise<FunctionResource[]>}
 */
export async function getOrCreateFunctionResources(
  functions: FileInfo[],
  serviceSid: string,
  client: GotClient
): Promise<FunctionResource[]> {
  const output: FunctionResource[] = [];
  const existingFunctions = await listFunctionResources(serviceSid, client);
  const functionsToCreate: RawFunctionWithPath[] = [];

  functions.forEach(fn => {
    const { path: functionPath, access } = getPathAndAccessFromFileInfo(
      fn,
      '.js'
    );
    const existingFn = existingFunctions.find(
      f => functionPath === f.friendly_name
    );
    if (!existingFn) {
      functionsToCreate.push({ ...fn, functionPath, access });
    } else {
      output.push({
        ...fn,
        functionPath,
        access,
        sid: existingFn.sid,
      });
    }
  });

  const createdFunctions = await Promise.all(
    functionsToCreate.map(async fn => {
      const newFunction = await createFunctionResource(
        fn.functionPath,
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
 * @param {GotClient} client API client
 * @returns {Promise<VersionResource>}
 */
async function createFunctionVersion(
  fn: FunctionResource,
  serviceSid: string,
  client: GotClient
): Promise<VersionResource> {
  if (fn.access === 'private') {
    throw new Error(`Function ${fn.functionPath} cannnot be "private". 
Please rename the file "${fn.name}" to "${fn.name.replace(
      '.private.',
      '.protected.'
    )}" or deploy it as an asset.`);
  }
  try {
    const resp = await client.post(
      `/Services/${serviceSid}/Functions/${fn.sid}/Versions`,
      {
        form: true,
        body: {
          Path: fn.functionPath,
          Visibility: fn.access,
        },
      }
    );

    return (resp.body as unknown) as VersionResource;
  } catch (err) {
    log('%O', err);
    throw new Error(`Failed to upload Function ${fn.functionPath}`);
  }
}

/**
 * Uploads a given function by creating a new version, reading the content if necessary and uploading the content
 *
 * @export
 * @param {FunctionResource} fn function to be uploaded
 * @param {string} serviceSid service that the function is connected to
 * @param {GotClient} client API client
 * @returns {Promise<Sid>}
 */
export async function uploadFunction(
  fn: FunctionResource,
  serviceSid: string,
  client: GotClient
): Promise<Sid> {
  let content: Buffer | string | undefined;
  if (typeof fn.content !== 'undefined') {
    content = fn.content;
  } else if (typeof fn.path !== 'undefined') {
    const encoding = extname(fn.path) === '.js' ? 'utf8' : undefined;
    content = await readFile(fn.path, encoding);
  } else {
    throw new Error('Missing either content or path for file');
  }

  const version = await createFunctionVersion(fn, serviceSid, client);
  const { pre_signed_upload_url: awsData } = version;
  const awsResult = await uploadToAws(
    awsData.url,
    awsData.kmsARN,
    content,
    fn.name
  );
  return version.sid;
}
