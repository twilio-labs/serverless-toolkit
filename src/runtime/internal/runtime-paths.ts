import {
  fsHelpers,
  ServerlessResourceConfigWithFilePath,
} from '@twilio-labs/serverless-api';

export type RouteInfo = {
  functions: ServerlessResourceConfigWithFilePath[];
  assets: ServerlessResourceConfigWithFilePath[];
};

export async function getFunctionsAndAssets(
  baseDir: string
): Promise<RouteInfo> {
  let { functions, assets } = await fsHelpers.getListOfFunctionsAndAssets(
    baseDir
  );
  return { functions, assets };
}
