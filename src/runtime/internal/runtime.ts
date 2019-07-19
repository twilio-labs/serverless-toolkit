import {
  AssetResourceMap,
  ResourceMap,
  RuntimeInstance,
  RuntimeSyncClientOptions,
  RuntimeSyncServiceContext,
} from '@twilio-labs/serverless-runtime-types/types';
import debug from 'debug';
import { readFileSync } from 'fs';
import twilio from 'twilio';
import { ServiceContext } from 'twilio/lib/rest/sync/v1/service';
import { SyncListListInstance } from 'twilio/lib/rest/sync/v1/service/syncList';
import { SyncMapListInstance } from 'twilio/lib/rest/sync/v1/service/syncMap';
import { StartCliConfig } from '../cli/config';

const log = debug('twilio-run:runtime');

const { getCachedResources } = require('./route-cache');

function getAssets(): AssetResourceMap {
  const { assets } = getCachedResources();
  if (assets.length === 0) {
    return {};
  }

  const result: AssetResourceMap = {};
  for (const asset of assets) {
    if (asset.access === 'private') {
      const prefix =
        process.env.TWILIO_FUNCTIONS_LEGACY_MODE === 'true' ? '/assets' : '';
      const open = () => readFileSync(asset.path, 'utf8');
      result[prefix + asset.assetPath] = { path: asset.path, open };
    }
  }
  log('Found the following assets available: %O', result);
  return result;
}

function getFunctions(): ResourceMap {
  const { functions } = getCachedResources();
  if (functions.length === 0) {
    return {};
  }

  const result: ResourceMap = {};
  for (const fn of functions) {
    result[fn.functionPath.substr(1)] = { path: fn.path };
  }
  log('Found the following functions available: %O', result);
  return result;
}

export type ExtendedSyncServiceContext = ServiceContext & {
  maps: SyncMapListInstance;
  lists: SyncListListInstance;
};

export function create({ env }: StartCliConfig): RuntimeInstance {
  function getSync(
    options?: RuntimeSyncClientOptions
  ): RuntimeSyncServiceContext {
    options = { serviceName: 'default', ...options };
    const { serviceName } = options;
    delete options.serviceName;

    const client = twilio(env.ACCOUNT_SID, env.AUTH_TOKEN, options);
    const service = client.sync.services(
      serviceName || 'default'
    ) as RuntimeSyncServiceContext;

    service.maps = service.syncMaps;
    service.lists = service.syncLists;
    return service;
  }

  return { getSync, getAssets, getFunctions };
}

module.exports = { create };
