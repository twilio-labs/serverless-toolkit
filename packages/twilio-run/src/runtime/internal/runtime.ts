import {
  AssetResourceMap,
  ResourceMap,
  RuntimeInstance,
  RuntimeSyncClientOptions,
  RuntimeSyncServiceContext,
} from '@twilio-labs/serverless-runtime-types/types';
import { readFileSync } from 'fs';
import twilio from 'twilio';
import { ServiceContext } from 'twilio/lib/rest/sync/v1/service';
import { SyncListListInstance } from 'twilio/lib/rest/sync/v1/service/syncList';
import { SyncMapListInstance } from 'twilio/lib/rest/sync/v1/service/syncMap';
import { checkForValidAccountSid } from '../../checks/check-account-sid';
import { StartCliConfig } from '../../config/start';
import { getDebugFunction } from '../../utils/logger';

const debug = getDebugFunction('twilio-run:runtime');

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
      const open = () => readFileSync(asset.filePath, 'utf8');
      result[prefix + asset.path] = { path: asset.filePath, open };
    }
  }
  debug('Found the following assets available: %O', result);
  return result;
}

function getFunctions(): ResourceMap {
  const { functions } = getCachedResources();
  if (functions.length === 0) {
    return {};
  }

  const result: ResourceMap = {};
  for (const fn of functions) {
    result[fn.path.substr(1)] = { path: fn.filePath };
  }
  debug('Found the following functions available: %O', result);
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

    checkForValidAccountSid(env.ACCOUNT_SID, {
      shouldPrintMessage: true,
      shouldThrowError: true,
      functionName: `Runtime.getSync(${[...arguments]
        .map((x: any) => JSON.stringify(x))
        .join(',')})`,
    });
    const client = twilio(env.ACCOUNT_SID, env.AUTH_TOKEN, options);
    const service = (client.sync.v1.services(
      serviceName || 'default'
    ) as unknown) as RuntimeSyncServiceContext;

    service.maps = service.syncMaps;
    service.lists = service.syncLists;
    return service;
  }

  return { getSync, getAssets, getFunctions };
}

module.exports = { create };
