/** @module @twilio-labs/serverless-api/dist/api */

const { promisfy } = require('util');

import debug from 'debug';
import FormData from 'form-data';
import {
  AssetApiResource,
  AssetList,
  AssetResource,
  GotClient,
  ServerlessResourceConfig,
  Sid,
  VersionResource,
} from '../types';
import { getContentType } from '../utils/content-type';
import { getPaginatedResource } from './utils/pagination';
import { ClientApiError } from '../utils/error';

const log = debug('twilio-serverless-api:assets');

/**
 * Calls the API to create a new Asset Resource
 *
 * @param  {string} name friendly name of the resource
 * @param  {string} serviceSid service to register asset under
 * @param  {GotClient} client API client
 * @returns {Promise<AssetApiResource>}
 */
async function createAssetResource(
  name: string,
  serviceSid: string,
  client: GotClient
): Promise<AssetApiResource> {
  try {
    const resp = await client.post(`Services/${serviceSid}/Assets`, {
      form: {
        FriendlyName: name,
      },
    });
    return (resp.body as unknown) as AssetApiResource;
  } catch (err) {
    log('%O', new ClientApiError(err));
    throw new Error(`Failed to create "${name}" asset`);
  }
}

/**
 * Calls the API to retrieve a list of all assets
 *
 * @param {string} serviceSid service to look for assets
 * @param {GotClient} client API client
 * @returns {Promise<AssetApiResource[]>}
 */
export async function listAssetResources(
  serviceSid: string,
  client: GotClient
) {
  try {
    return getPaginatedResource<AssetList, AssetApiResource>(
      client,
      `Services/${serviceSid}/Assets`
    );
  } catch (err) {
    log('%O', new ClientApiError(err));
    throw err;
  }
}
/**
 * Given a list of resources it will first check which assets already exists
 * and create the remaining ones.
 *
 * @param  {FileInfo[]} assets
 * @param  {string} serviceSid
 * @param  {GotClient} client
 * @returns {Promise<AssetResource[]>}
 */
export async function getOrCreateAssetResources(
  assets: ServerlessResourceConfig[],
  serviceSid: string,
  client: GotClient
): Promise<AssetResource[]> {
  const output: AssetResource[] = [];
  const existingAssets = await listAssetResources(serviceSid, client);
  const assetsToCreate: ServerlessResourceConfig[] = [];

  assets.forEach((asset) => {
    const existingAsset = existingAssets.find(
      (x) => asset.name === x.friendly_name
    );
    if (!existingAsset) {
      assetsToCreate.push(asset);
    } else {
      output.push({
        ...asset,
        sid: existingAsset.sid,
      });
    }
  });

  const createdAssets = await Promise.all(
    assetsToCreate.map(async (asset) => {
      const newAsset = await createAssetResource(
        asset.name,
        serviceSid,
        client
      );
      return {
        ...asset,
        sid: newAsset.sid,
      };
    })
  );

  return [...output, ...createdAssets];
}

/**
 * Given an asset it will create a new version instance for it
 *
 * @param  {AssetResource} asset the one to create a new version for
 * @param  {string} serviceSid the service to create the asset version for
 * @param  {GotClient} client API client
 * @returns {Promise<VersionResource>}
 */
async function createAssetVersion(
  asset: AssetResource,
  serviceSid: string,
  client: GotClient
): Promise<VersionResource> {
  try {
    const contentType = getContentType(
      asset.content,
      asset.filePath || asset.name
    );
    log('Uploading asset via form data with content-type "%s"', contentType);

    const contentOpts = {
      filename: asset.name,
      contentType: contentType,
    };

    const form = new FormData();
    form.append('Path', asset.path);
    form.append('Visibility', asset.access);
    form.append('Content', asset.content, contentOpts);

    const resp = await client.post(
      `Services/${serviceSid}/Assets/${asset.sid}/Versions`,
      {
        responseType: 'text',
        prefixUrl: 'https://serverless-upload.twilio.com/v1',
        body: form,
      }
    );

    return JSON.parse(resp.body) as VersionResource;
  } catch (err) {
    log('%O', new ClientApiError(err));
    throw new Error('Failed to upload Asset');
  }
}

/**
 * Uploads a given asset by creating a new version and uploading the content there
 *
 * @export
 * @param {AssetResource} asset The asset to upload
 * @param {string} serviceSid The service to upload it to
 * @param {GotClient} client The API client
 * @returns {Promise<Sid>}
 */
export async function uploadAsset(
  asset: AssetResource,
  serviceSid: string,
  client: GotClient
): Promise<Sid> {
  const version = await createAssetVersion(asset, serviceSid, client);
  return version.sid;
}
