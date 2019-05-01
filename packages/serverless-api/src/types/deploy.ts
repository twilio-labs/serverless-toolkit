/** @module @twilio-labs/serverless-api/dist/types */

import { PackageJson } from 'type-fest';
import { DeployStatus } from '../consts';
import { ClientConfig } from './client';
import {
  AssetResource,
  EnvironmentVariables,
  FileInfo,
  FunctionResource,
} from './generic';
import { Sid } from './serverless-api';

/**
 * Shared configuration of Deploy functions
 */
type DeployProjectConfigBase = {
  /**
   * Object of environment variables that should be set
   */
  env: EnvironmentVariables;
  /**
   * Optional Service SID of Serverless Service to create deployment for
   */
  serviceSid?: string;
  /**
   * An package.json object. `dependencies` in here will be installed in deployment
   */
  pkgJson: PackageJson;
  /**
   * Project name, used as `UniqueName` for Serverless Service.
   */
  projectName: string;
  /**
   * Name of Functions environment to deploy to. Will be used as domain suffix and `${value}-environment` for `UniqueName`
   */
  functionsEnv: string;
  /**
   * Run deployment in force mode
   */
  force?: boolean;
  /**
   * If no `serviceSid` is specified but a service with `projectName` is found, it will deploy to that one.
   */
  overrideExistingService?: boolean;
};

/**
 * Config for `client.deployProject`
 */
export type DeployProjectConfig = ClientConfig &
  DeployProjectConfigBase & {
    /**
     * List of functions that should be deployed
     */
    functions: FileInfo[];
    /**
     * List of assets that should be deployed
     */
    assets: FileInfo[];
  };

/**
 * Config for `client.deployLocalProject`
 */
export type DeployLocalProjectConfig = ClientConfig &
  DeployProjectConfigBase & {
    /**
     * Root path used to check for functions and assets.
     * Will be used to search for `functions`, `src`, `assets` and `static` directories
     */
    cwd: string;
    envPath: string;
  };

export type DeployResult = {
  serviceSid: Sid;
  environmentSid: Sid;
  buildSid: Sid;
  domain: string;
  functionResources: FunctionResource[];
  assetResources: AssetResource[];
};

export type StatusUpdate = {
  status: DeployStatus;
  message: string;
};

export type StatusUpdateCallback = (update: StatusUpdate) => void;
