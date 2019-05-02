/** @module @twilio-labs/serverless-api */

import { ClientConfig } from './client';
import {
  AssetVersion,
  BuildResource,
  EnvironmentResource,
  FunctionVersion,
  ServiceResource,
  Sid,
  VariableResource,
} from './serverless-api';

/**
 * Available types to list
 */
export type ListOptions =
  | 'environments'
  | 'services'
  | 'variables'
  | 'builds'
  | 'functions'
  | 'assets';

/**
 * Config used for `client.list`
 */
export type ListConfig = ClientConfig & {
  /**
   * Type or list of types that should be listed
   */
  types: ListOptions | ListOptions[];
  /**
   * Optional service SID required to list anything but `services`
   */
  serviceSid?: string;
  /**
   * Project namee as alternative to `serviceSid`
   */
  projectName?: string;
  /**
   * Environment SID or domain suffix. Required to list variables, functions and assets
   */
  environment?: string | Sid;
};

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
