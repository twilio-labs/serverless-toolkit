/** @module @twilio-labs/serverless-api */

import got = require('got');

export type GotClient = typeof got;

export type EnvironmentVariables = {
  [key: string]: string | number | undefined;
};

/**
 * Necessary info to deploy a function or asset
 */
export type FileInfo = {
  /**
   * Relative file name/path. Will be used to create the Serverless paths. Example:
   * `example.js` => `/example`
   * `sms/reply.protected.js` => `/sms/reply`
   * `index.html` => `/index.html`
   */
  name: string;
  /**
   * Path on file system to read the contents from
   */
  path?: string;
  /**
   * Alternantive to `path` if you want to specify the content directly.
   * Can be a string or a `Buffer` instance representing the content.
   */
  content?: string | Buffer;
};

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

export type AccessOptions = 'private' | 'protected' | 'public';

export type ResourcePathAndAccess = {
  path: string;
  access: AccessOptions;
};

export type DirectoryContent = {
  assets: FileInfo[];
  functions: FileInfo[];
};
