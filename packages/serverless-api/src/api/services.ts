/** @module @twilio-labs/serverless-api/dist/api */

import debug from 'debug';
import { ServiceList, ServiceResource, Sid } from '../types';
import { TwilioServerlessApiClient } from '../client';
import { getPaginatedResource } from './utils/pagination';
import { ClientApiError } from '../utils/error';

const log = debug('twilio-serverless-api:services');

/**
 * Creates a new service given a service name
 *
 * @export
 * @param {string} serviceName the unique name for the service
 * @param {TwilioServerlessApiClient} client API client
 * @returns {Promise<string>}
 */
export async function createService(
  serviceName: string,
  client: TwilioServerlessApiClient
): Promise<string> {
  try {
    const resp = await client.request('post', 'Services', {
      form: {
        UniqueName: serviceName,
        FriendlyName: serviceName,
        IncludeCrendentials: true,
      },
    });
    const service = (resp.body as unknown) as ServiceResource;

    return service.sid;
  } catch (err) {
    log('%O', new ClientApiError(err));
    throw err;
  }
}

/**
 * Lists all services attached to an account
 *
 * @export
 * @param {TwilioServerlessApiClient} client API client
 * @returns {Promise<ServiceResource[]>}
 */
export async function listServices(
  client: TwilioServerlessApiClient
): Promise<ServiceResource[]> {
  return getPaginatedResource<ServiceList, ServiceResource>(client, 'Services');
}

/**
 * Tries to find the service SID associated to a service name
 *
 * @export
 * @param {string} uniqueName the unique name of the service
 * @param {TwilioServerlessApiClient} client API client
 * @returns {(Promise<string | undefined>)}
 */
export async function findServiceSid(
  uniqueName: string,
  client: TwilioServerlessApiClient
): Promise<string | undefined> {
  try {
    const services = await listServices(client);
    for (let service of services) {
      if (service.unique_name === uniqueName) {
        return service.sid;
      }
    }
  } catch (err) {
    log('%O', new ClientApiError(err));
    throw err;
  }
  return undefined;
}

export async function getService(
  sid: Sid,
  client: TwilioServerlessApiClient
): Promise<ServiceResource> {
  try {
    const resp = await client.request('get', `Services/${sid}`);
    return (resp.body as unknown) as ServiceResource;
  } catch (err) {
    log('%O', new ClientApiError(err));
    throw err;
  }
}
