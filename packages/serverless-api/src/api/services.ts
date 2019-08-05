/** @module @twilio-labs/serverless-api/dist/api */

import debug from 'debug';
import { GotClient, ServiceList, ServiceResource, Sid } from '../types';
import { getPaginatedResource } from './utils/pagination';

const log = debug('twilio-serverless-api:services');

/**
 * Creates a new service given a service name
 *
 * @export
 * @param {string} serviceName the unique name for the service
 * @param {GotClient} client API client
 * @returns {Promise<string>}
 */
export async function createService(
  serviceName: string,
  client: GotClient
): Promise<string> {
  try {
    const resp = await client.post('/Services', {
      form: true,
      body: {
        UniqueName: serviceName,
        FriendlyName: serviceName,
        IncludeCrendentials: true,
      },
    });
    const service = (resp.body as unknown) as ServiceResource;

    return service.sid;
  } catch (err) {
    log('%O', err);
    throw err;
  }
}

/**
 * Lists all services attached to an account
 *
 * @export
 * @param {GotClient} client API client
 * @returns {Promise<ServiceResource[]>}
 */
export async function listServices(
  client: GotClient
): Promise<ServiceResource[]> {
  return getPaginatedResource<ServiceList, ServiceResource>(
    client,
    '/Services'
  );
}

/**
 * Tries to find the service SID associated to a service name
 *
 * @export
 * @param {string} uniqueName the unique name of the service
 * @param {GotClient} client API client
 * @returns {(Promise<string | undefined>)}
 */
export async function findServiceSid(
  uniqueName: string,
  client: GotClient
): Promise<string | undefined> {
  try {
    const services = await listServices(client);
    for (let service of services) {
      if (service.unique_name === uniqueName) {
        return service.sid;
      }
    }
  } catch (err) {
    log('%O', err);
    throw err;
  }
  return undefined;
}

export async function getService(
  sid: Sid,
  client: GotClient
): Promise<ServiceResource> {
  try {
    const resp = await client.get(`/Services/${sid}`);
    return (resp.body as unknown) as ServiceResource;
  } catch (err) {
    log('%O', err);
    throw err;
  }
}
