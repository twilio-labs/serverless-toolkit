import debug from 'debug';
import { extname } from 'path';
import {
  AssetApiResource,
  AssetList,
  VersionResource,
} from '../serverless-api-types';
import { AssetResource, FileInfo, GotClient, RawAssetWithPath } from '../types';
import { uploadToAws } from '../utils/aws-upload';
import { getPathAndAccessFromFileInfo, readFile } from '../utils/fs';

const log = debug('twilio-serverless-api/assets');

async function createAssetResource(
  name: string,
  serviceSid: string,
  client: GotClient
) {
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

async function getAssetResources(serviceSid: string, client: GotClient) {
  try {
    const resp = await client.get(`/Services/${serviceSid}/Assets`);
    const content = (resp.body as unknown) as AssetList;
    return content.assets;
  } catch (err) {
    log('%O', err);
    throw err;
  }
}

export async function getOrCreateAssetResources(
  assets: FileInfo[],
  serviceSid: string,
  client: GotClient
): Promise<AssetResource[]> {
  const output: AssetResource[] = [];
  const existingAssets = await getAssetResources(serviceSid, client);
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

async function createAssetVersion(
  asset: AssetResource,
  serviceSid: string,
  client: GotClient
) {
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

export async function uploadAsset(
  asset: AssetResource,
  serviceSid: string,
  client: GotClient
) {
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
