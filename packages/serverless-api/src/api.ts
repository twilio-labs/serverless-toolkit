/** @module @twilio-labs/serverless-api */

import * as internals from './internals/index';
import * as fs from './utils/fs';

export const fsHelpers = fs;
export const api = internals;
export {
  activateBuild,
  triggerBuild,
  waitForSuccessfulBuild,
} from './internals/builds';
export { getDependencies } from './internals/dependencies';
export {
  getOrCreateFunctionResources,
  uploadFunction,
} from './internals/functions';
export { setEnvironmentVariables } from './internals/variables';
