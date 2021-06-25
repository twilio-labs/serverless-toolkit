import { ClientConfig } from './client';
import { EnvironmentVariables } from './generic';
import { Sid } from './serverless-api';

export type KeyValue = {
  key: string;
  value?: string;
};

export type GetEnvironmentVariablesConfig = ClientConfig & {
  serviceSid?: string;
  serviceName?: string;
  environment: string | Sid;
  keys: string[];
  getValues: boolean;
};

export type SetEnvironmentVariablesConfig = ClientConfig & {
  serviceSid?: string;
  serviceName?: string;
  environment: string | Sid;
  env: EnvironmentVariables;
  append: boolean;
};

export type RemoveEnvironmentVariablesConfig = ClientConfig & {
  serviceSid?: string;
  serviceName?: string;
  environment: string | Sid;
  keys: string[];
};

export type GetEnvironmentVariablesResult = {
  serviceSid: Sid;
  environmentSid: Sid;
  variables: KeyValue[];
};

export type SetEnvironmentVariablesResult = {
  serviceSid: Sid;
  environmentSid: Sid;
};

export type RemoveEnvironmentVariablesResult = {
  serviceSid: Sid;
  environmentSid: Sid;
};
