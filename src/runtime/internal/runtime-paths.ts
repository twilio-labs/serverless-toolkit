import {
  fsHelpers,
  ServerlessResourceConfigWithFilePath,
} from '@twilio-labs/serverless-api';
import { SearchConfig } from '@twilio-labs/serverless-api/dist/utils';

export type RouteInfo = {
  functions: ServerlessResourceConfigWithFilePath[];
  assets: ServerlessResourceConfigWithFilePath[];
};

export async function getFunctionsAndAssets(
  baseDir: string,
  config?: SearchConfig
): Promise<RouteInfo> {
  let { functions, assets } = await fsHelpers.getListOfFunctionsAndAssets(
    baseDir,
    config
  );
  return { functions, assets };
}
