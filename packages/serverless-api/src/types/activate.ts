/** @module @twilio-labs/serverless-api */

import { ClientConfig } from './client';
import { Sid } from './serverless-api';
import { EnvironmentVariables } from './generic';

export type ActivateConfig = ClientConfig & {
  force?: boolean;
  createEnvironment?: boolean;
  serviceSid: Sid;
  buildSid?: Sid;
  targetEnvironment: string | Sid;
  sourceEnvironment?: string | Sid;
  env: EnvironmentVariables;
};

export type ActivateResult = {
  serviceSid: Sid;
  buildSid: Sid;
  environmentSid: Sid;
  domain: string;
};
