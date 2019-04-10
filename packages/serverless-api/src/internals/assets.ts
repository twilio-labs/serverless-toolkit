import debug from 'debug';
import path, { extname } from 'path';
import {
  AssetApiResource,
  AssetList,
  VersionResource,
} from '../serverless-api-types';
import { AssetResource, FileInfo, GotClient, RawAssetWithPath } from '../types';
import { uploadToAws } from '../utils/aws-upload';
import { readFile } from '../utils/fs';

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
    throw new Error(`Failed to create "${name}" asset`);
  }
}

async function getAssetResources(serviceSid: string, client: GotClient) {
  const resp = await client.get(`/Services/${serviceSid}/Assets`);
  const content = (resp.body as unknown) as AssetList;
  return content.assets;
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
    const assetPath = `/${path
      .basename(asset.name, '.js')
      .replace(/\s/g, '-')}`;
    const existingAsset = existingAssets.find(
      x => asset.name === x.friendly_name
    );
    if (!existingAsset) {
      assetsToCreate.push({ ...asset, assetPath });
    } else {
      output.push({
        ...asset,
        assetPath,
        sid: existingAsset.sid,
      });
    }
  });

  const createdAssets = await Promise.all(
    assetsToCreate.map(async asset => {
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
          Visibility: 'public',
        },
      }
    );

    return (resp.body as unknown) as VersionResource;
  } catch (err) {
    log(err);
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
