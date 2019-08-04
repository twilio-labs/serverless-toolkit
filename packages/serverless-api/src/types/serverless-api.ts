/** @module @twilio-labs/serverless-api */

import { Dependency } from './generic';

export type Sid = string;

export interface ResourceBase {
  sid: Sid;
  account_sid: Sid;
  date_created: string;
  url: string;
}

export interface UpdateableResourceBase extends ResourceBase {
  date_updated: string;
}

export interface FunctionApiResource extends UpdateableResourceBase {
  friendly_name: string;
}

export interface FunctionList {
  functions: FunctionApiResource[];
}

export interface AssetApiResource extends UpdateableResourceBase {
  friendly_name: string;
}

export interface AssetList {
  assets: AssetApiResource[];
}

export interface ServiceResource extends UpdateableResourceBase {
  unique_name: string;
}

export interface ServiceList {
  services: ServiceResource[];
}

export interface EnvironmentResource extends UpdateableResourceBase {
  unique_name: string;
  domain_name: string;
  build_sid: string;
  domain_suffix: string;
}

export interface EnvironmentList {
  environments: EnvironmentResource[];
}

export interface VersionResource extends UpdateableResourceBase {
  pre_signed_upload_url: {
    url: string;
    kmsARN: string;
  };
}

export type BuildStatus = 'building' | 'completed' | 'failed';

export interface VersionOnBuild extends UpdateableResourceBase {
  path: string;
  visibility: 'public' | 'protected' | 'private';
  service_sid: string;
}

export interface FunctionVersion extends VersionOnBuild {
  function_sid: string;
}

export interface AssetVersion extends VersionOnBuild {
  asset_sid: string;
}

export interface BuildResource extends UpdateableResourceBase {
  status: BuildStatus;
  function_versions: FunctionVersion[];
  asset_versions: AssetVersion[];
}

export interface BuildList {
  builds: BuildResource[];
}

export interface VariableResource extends UpdateableResourceBase {
  environment_sid: string;
  value: string;
  key: string;
  service_sid: string;
}

export interface VariableList {
  variables: VariableResource[];
}

export type BuildConfig = {
  dependencies?: Dependency[];
  functionVersions?: Sid[];
  assetVersions?: Sid[];
};

export interface LogApiResource extends ResourceBase {
  service_sid: string;
  environment_sid: string;
  deployment_sid: string;
  function_sid: string;
  request_sid: string;
  level: string;
  message: string;
}

export interface LogList {
  logs: LogApiResource[];
}
