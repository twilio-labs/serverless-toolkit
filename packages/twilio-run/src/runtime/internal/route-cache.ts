import { ServerlessResourceConfigWithFilePath } from '@twilio-labs/serverless-api';
import { SearchConfig } from '@twilio-labs/serverless-api/dist/utils';
import { Merge } from 'type-fest';
import { StartCliConfig } from '../../config/start';
import { RouteInfo, getFunctionsAndAssets } from './runtime-paths';

type ExtendedRouteInfo =
  | Merge<{ type: 'function' }, ServerlessResourceConfigWithFilePath>
  | Merge<{ type: 'asset' }, ServerlessResourceConfigWithFilePath>;

const allRoutes = new Map<string, ExtendedRouteInfo>();
const assetsCache = new Set<ServerlessResourceConfigWithFilePath>();
const functionsCache = new Set<ServerlessResourceConfigWithFilePath>();

export async function getRouteMap(config: StartCliConfig) {
  const searchConfig: SearchConfig = {};

  if (config.functionsFolderName) {
    searchConfig.functionsFolderNames = [config.functionsFolderName];
  }

  if (config.assetsFolderName) {
    searchConfig.assetsFolderNames = [config.assetsFolderName];
  }

  let routes = await getFunctionsAndAssets(config.baseDir, searchConfig);
  return setRoutes(routes);
}

export function setRoutes({ functions, assets }: RouteInfo) {
  allRoutes.clear();
  assetsCache.clear();
  functionsCache.clear();

  functions.forEach((fn) => {
    if (!fn.path) {
      return;
    }

    if (allRoutes.has(fn.path)) {
      throw new Error(`Duplicate. Path ${fn.path} already exists`);
    }
    functionsCache.add(fn);
    allRoutes.set(fn.path, {
      ...fn,
      type: 'function',
    });
  });

  assets.forEach((asset) => {
    if (!asset.path) {
      return;
    }

    if (allRoutes.has(asset.path)) {
      throw new Error(`Duplicate. Path ${asset.path} already exists`);
    }
    assetsCache.add(asset);
    allRoutes.set(asset.path, {
      ...asset,
      type: 'asset',
    });
  });

  return new Map(allRoutes);
}

export function getRoutes(): Map<string, ExtendedRouteInfo> {
  return new Map(allRoutes);
}

export function getCachedResources(): RouteInfo {
  return {
    assets: Array.from(assetsCache),
    functions: Array.from(functionsCache),
  };
}
