/** @module @twilio-labs/serverless-api/dist/utils */

/**
 * Resolves after a given amount of milliseconds
 * @param  {number} ms milliseconds to wait
 */
export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));
