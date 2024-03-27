import type {
  ServiceContext,
  SyncListListInstance,
  SyncMapListInstance,
} from '@twilio-labs/serverless-runtime-types/types';
import {
  AssetResourceMap,
  ResourceMap,
  RuntimeInstance,
  RuntimeSyncClientOptions,
  RuntimeSyncServiceContext,
} from '@twilio-labs/serverless-runtime-types/types';
import { readFileSync } from 'fs';
import { checkForValidAccountSid } from '../checks/check-account-sid';
import { ServerConfig } from '../types';
import debug from '../utils/debug';
import { requireFromProject } from '../utils/requireFromProject';
import { getCachedResources } from './route-cache';

const log = debug('twilio-runtime-handler:dev:runtime');

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
  log('Found the following assets available: %o', result);
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
  log('Found the following functions available: %o', result);
  return result;
}

export type ExtendedSyncServiceContext = ServiceContext & {
  maps: SyncMapListInstance;
  lists: SyncListListInstance;
};

export function create({
  env,
  logger,
  baseDir,
}: ServerConfig): RuntimeInstance {
  function getSync(
    options?: RuntimeSyncClientOptions
  ): RuntimeSyncServiceContext {
    options = { serviceName: 'default', lazyLoading: true, ...options };
    const { serviceName } = options;
    delete options.serviceName;

    checkForValidAccountSid(env.ACCOUNT_SID, {
      shouldPrintMessage: true,
      shouldThrowError: true,
      logger: logger,
      functionName: `Runtime.getSync(${[...arguments]
        .map((x: any) => JSON.stringify(x))
        .join(',')})`,
    });
    const client = requireFromProject(baseDir, 'twilio', true)(
      env.ACCOUNT_SID,
      env.AUTH_TOKEN,
      options
    );
    const service = client.sync.v1.services(
      serviceName || 'default'
    ) as RuntimeSyncServiceContext;

    service.maps = service.syncMaps;
    service.lists = service.syncLists;
    return service;
  }

  return { getSync, getAssets, getFunctions };
}

module.exports = { create };
