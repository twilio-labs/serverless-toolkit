/** @module @twilio-labs/serverless-api/dist/api */

import debug from 'debug';
import { GotClient, LogApiResource, LogList, Sid } from '../types';

const log = debug('twilio-serverless-api:logs');

/**
 * Calls the API to retrieve a list of all assets
 *
 * @param {Sid} environmentSid environment in which to get logs
 * @param {Sid} serviceSid service to look for logs
 * @param {GotClient} client API client
 * @returns {Promise<LogApiResource[]>}
 */
export async function listLogResources(
  environmentSid: Sid,
  serviceSid: Sid,
  client: GotClient
) {
  try {
    const resp = await client.get(
      `/Services/${serviceSid}/Environments/${environmentSid}/Logs`
    );
    const content = (resp.body as unknown) as LogList;
    return content.logs;
  } catch (err) {
    log('%O', err);
    throw err;
  }
}

/**
 * Calls the API to retrieve a list of all assets
 *
 * @param {Sid} logSid SID of log to retrieve
 * @param {Sid} environmentSid environment in which to get logs
 * @param {Sid} serviceSid service to look for logs
 * @param {GotClient} client API client
 * @returns {Promise<LogApiResource>}
 */
export async function getLog(
  logSid: Sid,
  environmentSid: Sid,
  serviceSid: Sid,
  client: GotClient
) {
  try {
    const resp = await client.get(
      `/Services/${serviceSid}/Environments/${environmentSid}/Logs/${logSid}`
    );
    return (resp.body as unknown) as LogApiResource;
  } catch (err) {
    log('%O', err);
    throw err;
  }
}
