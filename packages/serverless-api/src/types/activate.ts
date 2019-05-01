import { ClientConfig } from './client';
import { Sid } from './serverless-api';

export type ActivateConfig = ClientConfig & {
  force?: boolean;
  createEnvironment?: boolean;
  serviceSid: Sid;
  buildSid?: Sid;
  targetEnvironment: string | Sid;
  sourceEnvironment?: string | Sid;
};

export type ActivateResult = {
  serviceSid: Sid;
  buildSid: Sid;
  environmentSid: Sid;
};
