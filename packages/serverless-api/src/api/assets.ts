/** @module @twilio-labs/serverless-api/dist/api */

const { promisfy } = require('util');

import debug from 'debug';
import { extname } from 'path';
import {
  AssetApiResource,
  AssetList,
  AssetResource,
  FileInfo,
  GotClient,
  RawAssetWithPath,
  Sid,
  VersionResource,
} from '../types';
import { uploadToAws } from '../utils/aws-upload';
import { getPathAndAccessFromFileInfo, readFile } from '../utils/fs';

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
    const resp = await client.post(`/Services/${serviceSid}/Assets`, {
      form: true,
      body: {
        FriendlyName: name,
      },
    });
    return (resp.body as unknown) as AssetApiResource;
  } catch (err) {
    log('%O', err);
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
export async function listAssetResources(serviceSid: string, client: GotClient) {
  try {
    const resp = await client.get(`/Services/${serviceSid}/Assets`);
    const content = (resp.body as unknown) as AssetList;
    return content.assets;
  } catch (err) {
    log('%O', err);
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
  assets: FileInfo[],
  serviceSid: string,
  client: GotClient
): Promise<AssetResource[]> {
  const output: AssetResource[] = [];
  const existingAssets = await listAssetResources(serviceSid, client);
  const assetsToCreate: RawAssetWithPath[] = [];

  assets.forEach(asset => {
    const { path: assetPath, access } = getPathAndAccessFromFileInfo(asset);
    const existingAsset = existingAssets.find(
      x => assetPath === x.friendly_name
    );
    if (!existingAsset) {
      assetsToCreate.push({ ...asset, assetPath, access });
    } else {
      output.push({
        ...asset,
        assetPath,
        access,
        sid: existingAsset.sid,
      });
    }
  });

  const createdAssets = await Promise.all(
    assetsToCreate.map(async asset => {
      const newAsset = await createAssetResource(
        asset.assetPath,
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
    const resp = await client.post(
      `/Services/${serviceSid}/Assets/${asset.sid}/Versions`,
      {
        form: true,
        body: {
          Path: asset.assetPath,
          Visibility: asset.access,
        },
      }
    );

    return (resp.body as unknown) as VersionResource;
  } catch (err) {
    log('%O', err);
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
  let content: Buffer | string | undefined;
  if (typeof asset.content !== 'undefined') {
    content = asset.content;
  } else if (typeof asset.path !== 'undefined') {
    const encoding = extname(asset.path) === '.js' ? 'utf8' : undefined;
    content = await readFile(asset.path, encoding);
  } else {
    throw new Error('Missing either content or path for file');
  }

  const version = await createAssetVersion(asset, serviceSid, client);
  const { pre_signed_upload_url: awsData } = version;
  const awsResult = await uploadToAws(
    awsData.url,
    awsData.kmsARN,
    content,
    asset.name
  );
  return version.sid;
}
