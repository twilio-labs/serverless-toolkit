import { PackageJson } from 'type-fest';
import { DeployStatus } from './consts';
import {
  AssetVersion,
  BuildResource,
  EnvironmentResource,
  FunctionVersion,
  ServiceResource,
  Sid,
  VariableResource,
} from './serverless-api-types';
import { AccessOptions } from './utils/fs';
import got = require('got');

export type EnvironmentVariables = {
  [key: string]: string | number | undefined;
};

export type ClientConfig = {
  accountSid: string;
  authToken: string;
};

type DeployProjectConfigBase = {
  env: EnvironmentVariables;
  serviceSid?: string;
  pkgJson: PackageJson;
  projectName: string;
  functionsEnv: string;
  force: boolean;
  overrideExistingService: boolean;
};

export type FileInfo = {
  name: string;
  path?: string;
  content?: string | Buffer;
};

export type DeployProjectConfig = ClientConfig &
  DeployProjectConfigBase & {
    functions: FileInfo[];
    assets: FileInfo[];
  };

export type DeployLocalProjectConfig = ClientConfig &
  DeployProjectConfigBase & {
    cwd: string;
    envPath: string;
  };

export type ListOptions = 'environments' | 'services' | 'variables' | 'builds';
export type ListConfig = ClientConfig & {
  types: ListOptions | ListOptions[];
  serviceSid?: string;
  projectName?: string;
  environment?: string | Sid;
};

export type StatusUpdate = {
  status: DeployStatus;
  message: string;
};

export type StatusUpdateCallback = (update: StatusUpdate) => void;

export type ListResult = {
  services?: ServiceResource[];
  environments?: EnvironmentResource[];
  builds?: BuildResource[];
  variables?: {
    environmentSid: string;
    entries: VariableResource[];
  };
  functions?: {
    environmentSid: string;
    entries: FunctionVersion[];
  };
  assets?: {
    environmentSid: string;
    entries: AssetVersion[];
  };
};

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

export type GotClient = typeof got;

export type RawFunctionWithPath = FileInfo & {
  functionPath: string;
  access: AccessOptions;
};

export type RawAssetWithPath = FileInfo & {
  assetPath: string;
  access: AccessOptions;
};

export type FunctionResource = RawFunctionWithPath & {
  sid: string;
};

export type AssetResource = RawAssetWithPath & {
  sid: string;
};

export type Dependency = {
  name: string;
  version: string;
};

export type Variable = {
  key: string;
  value: string;
};

export type DeployResult = {
  serviceSid: Sid;
  environmentSid: Sid;
  buildSid: Sid;
  domain: string;
  functionResources: FunctionResource[];
  assetResources: AssetResource[];
};
