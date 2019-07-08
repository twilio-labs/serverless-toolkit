import {
  fsHelpers,
  AccessOptions,
  FileInfo,
} from '@twilio-labs/serverless-api';

export type FunctionInfo = FileInfo & {
  functionPath: string;
  access: AccessOptions;
};

export type AssetInfo = FileInfo & {
  assetPath: string;
  access: AccessOptions;
};

export type RouteInfo = {
  functions: FunctionInfo[];
  assets: AssetInfo[];
};

export async function getFunctionsAndAssets(
  baseDir: string
): Promise<RouteInfo> {
  let {
    functions: functionsRaw,
    assets: assetsRaw,
  } = await fsHelpers.getListOfFunctionsAndAssets(baseDir);
  const functions = functionsRaw.map<FunctionInfo>(fileInfo => {
    const info = fsHelpers.getPathAndAccessFromFileInfo(fileInfo, '.js');
    return {
      ...fileInfo,
      functionPath: info.path,
      access: info.access,
    };
  });
  const assets = assetsRaw.map(fileInfo => {
    const info = fsHelpers.getPathAndAccessFromFileInfo(fileInfo);
    return {
      ...fileInfo,
      assetPath: info.path,
      access: info.access,
    };
  });
  return { functions, assets };
}
