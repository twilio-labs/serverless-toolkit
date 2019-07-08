import { RouteInfo, AssetInfo, FunctionInfo } from './runtime-paths';

type ExtendedRouteInfo = {
  type: 'function' | 'asset';
} & (FunctionInfo | AssetInfo);

const allRoutes = new Map<string, ExtendedRouteInfo>();
const assetsCache = new Set<AssetInfo>();
const functionsCache = new Set<FunctionInfo>();

export function setRoutes({ functions, assets }: RouteInfo) {
  allRoutes.clear();
  assetsCache.clear();
  functionsCache.clear();

  functions.forEach(fn => {
    if (allRoutes.has(fn.functionPath)) {
      throw new Error(`Duplicate. Path ${fn.functionPath} already exists`);
    }
    functionsCache.add(fn);
    allRoutes.set(fn.functionPath, {
      ...fn,
      type: 'function',
    });
  });

  assets.forEach(asset => {
    if (allRoutes.has(asset.assetPath)) {
      throw new Error(`Duplicate. Path ${asset.assetPath} already exists`);
    }
    assetsCache.add(asset);
    allRoutes.set(asset.assetPath, {
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
