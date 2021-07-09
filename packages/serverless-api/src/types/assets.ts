import { Sid } from './serverless-api';
import { ResourcePathAndAccess } from './generic';

export type AssetDeployConfig = {
  serviceSid: Sid;
  environmentSid: Sid;
  assetOptions: ResourcePathAndAccess;
  force?: boolean;
  newPath?: string;
};
