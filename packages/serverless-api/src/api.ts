/** @module @twilio-labs/serverless-api */

import * as internals from './api/index';
import * as fs from './utils/fs';

export const fsHelpers = fs;
export const api = internals;
export {
  activateBuild,
  triggerBuild,
  waitForSuccessfulBuild,
} from './api/builds';
export { getDependencies } from './api/dependencies';
export { getOrCreateFunctionResources, uploadFunction } from './api/functions';
export { setEnvironmentVariables } from './api/variables';
