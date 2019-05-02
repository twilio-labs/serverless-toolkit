/** @module @twilio-labs/serverless-api/dist/api */

import debug from 'debug';
import { GotClient, ServiceList, ServiceResource } from '../types';

const log = debug('twilio-serverless-api:services');

/**
 * Creates a new service given a project name
 *
 * @export
 * @param {string} projectName the unique name for the service
 * @param {GotClient} client API client
 * @returns {Promise<string>}
 */
export async function createService(
  projectName: string,
  client: GotClient
): Promise<string> {
  try {
    const resp = await client.post('/Services', {
      form: true,
      body: {
        UniqueName: projectName,
        FriendlyName: projectName,
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
  const resp = await client.get('/Services');
  const { services } = (resp.body as unknown) as ServiceList;
  return services;
}

/**
 * Tries to find the service SID associated to a project name
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
