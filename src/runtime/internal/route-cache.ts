const allRoutes = new Map();
const assetsCache = new Set();
const functionsCache = new Set();

export function setRoutes({ functions, assets }) {
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

export function getRoutes() {
  return new Map(allRoutes);
}

export function getCachedResources() {
  return {
    assets: Array.from(assetsCache),
    functions: Array.from(functionsCache),
  };
}
