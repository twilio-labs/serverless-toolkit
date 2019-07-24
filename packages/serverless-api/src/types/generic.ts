/** @module @twilio-labs/serverless-api */

import got = require('got');

export type GotClient = typeof got;

export type EnvironmentVariables = {
  [key: string]: string | undefined;
};

export type FileInfo = {
  name: string;
  path: string;
};

/**
 * Necessary info to deploy a function
 */
export type ServerlessResourceConfig = {
  /**
   * Access for the function
   */
  access: AccessOptions;
  /**
   * Content of the uploaded function
   */
  content: string | Buffer;
  /**
   * Function name
   */
  name: string;
  /**
   * Path for the serverless resource
   * Functions: '/some-function'
   * Assets: '/some-assets.jpg'
   */
  path: string;
};

export type ServerlessResourceConfigWithFilePath = ServerlessResourceConfig & {
  /**
   * Path to the actual file on the file system.
   */
  filePath: string;
};

export type FunctionResource = ServerlessResourceConfig & {
  sid: string;
};

export type AssetResource = ServerlessResourceConfig & {
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

export type AccessOptions = 'private' | 'protected' | 'public';

export type ResourcePathAndAccess = {
  path: string;
  access: AccessOptions;
};

export type DirectoryContent = {
  assets: ServerlessResourceConfigWithFilePath[];
  functions: ServerlessResourceConfigWithFilePath[];
};
