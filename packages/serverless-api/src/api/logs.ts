/** @module @twilio-labs/serverless-api/dist/api */

import debug from 'debug';
import { GotClient, LogApiResource, LogList, Sid, LogFilters } from '../types';
import { getPaginatedResource } from './utils/pagination';

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
    return getPaginatedResource<LogList, LogApiResource>(
      client,
      `/Services/${serviceSid}/Environments/${environmentSid}/Logs`
    );
  } catch (err) {
    log('%O', err);
    throw err;
  }
}

/**
 * Calls the API to retrieve a list of all assets
 *
 * @param {Sid} environmentSid environment in which to get logs
 * @param {Sid} serviceSid service to look for logs
 * @param {GotClient} client API client
 * @returns {Promise<LogApiResource[]>}
 */
export async function listOnePageLogResources(
  environmentSid: Sid,
  serviceSid: Sid,
  client: GotClient,
  filters: LogFilters
): Promise<LogApiResource[]> {
  const pageSize = filters.pageSize || 50;
  const { functionSid, startDate, endDate, pageToken } = filters;
  try {
    let url = `/Services/${serviceSid}/Environments/${environmentSid}/Logs?PageSize=${pageSize}`;
    if (typeof functionSid !== 'undefined') {
      url += `&FunctionSid=${functionSid}`;
    }
    if (typeof startDate !== 'undefined') {
      url += `&StartDate=${
        startDate instanceof Date ? startDate.toISOString() : startDate
      }`;
    }
    if (typeof endDate !== 'undefined') {
      url += `&EndDate=${
        endDate instanceof Date ? endDate.toISOString() : endDate
      }`;
    }
    if (typeof pageToken !== 'undefined') {
      url += `&PageToken=${pageToken}`;
    }
    const resp = await client.get(url);
    const content = (resp.body as unknown) as LogList;
    return content.logs as LogApiResource[];
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
