/** @module @twilio-labs/serverless-api */

import * as internals from './api/index';
import * as fs from './utils/fs';
import * as _utils from './utils/index';

export const fsHelpers = fs;
export const api = internals;
export const utils = _utils;
export {
  activateBuild,
  triggerBuild,
  waitForSuccessfulBuild,
} from './api/builds';
export { getDependencies } from './api/dependencies';
export { getOrCreateFunctionResources, uploadFunction } from './api/functions';
export { setEnvironmentVariables } from './api/variables';
