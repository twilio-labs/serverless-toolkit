import { PackageJson } from 'type-fest';
import { FileInfo } from './utils/fs';
import got = require('got');

export type EnvironmentVariables = {
  [key: string]: string | number | undefined;
};

export type ClientConfig = {
  accountSid: string;
  authToken: string;
};

export type DeployLocalProjectConfig = ClientConfig & {
  cwd: string;
  envPath: string;
  env: EnvironmentVariables;
  serviceSid?: string;
  pkgJson: PackageJson;
  projectName: string;
  functionsEnv: string;
};

export type GotClient = typeof got;

export interface RawFunctionWithPath extends FileInfo {
  functionPath: string;
}

export interface FunctionResource extends RawFunctionWithPath {
  sid: string;
}

export type Dependency = {
  name: string;
  version: string;
};

export type Variable = {
  key: string;
  value: string;
};
