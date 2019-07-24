/** @module @twilio-labs/serverless-api/dist/api */

import debug from 'debug';
import { EnvironmentList, EnvironmentResource, GotClient, Sid } from '../types';

const log = debug('twilio-serverless-api:environments');

/**
 * Generates a unique name for an environment given a domain suffix
 *
 * @param {string} suffix
 * @returns {string}
 */
function getUniqueNameFromSuffix(suffix: string): string {
  return suffix.length === 0 ? 'production' : suffix;
}

/**
 * In old versions of the tool, environments were created with the unique name
 * "{domainSuffix}-environment" this function searches for that
 *
 * @param {EnvironmentResource[]} environments list of environment resources
 * @param {string} domainSuffix the domain suffix that is searched for
 * @returns {(EnvironmentResource | undefined)}
 */
function findLegacyEnvironments(
  environments: EnvironmentResource[],
  domainSuffix: string
): EnvironmentResource | undefined {
  return environments.find(
    env => env.unique_name === `${domainSuffix}-environment`
  );
}

/**
 * Checks if a string is an environment SID by checking its prefix and length
 *
 * @export
 * @param {string} str the string to check
 * @returns
 */
export function isEnvironmentSid(str: string) {
  return str.startsWith('ZE') && str.length === 34;
}

/**
 * Retrieves a specific environment using the API
 *
 * @export
 * @param {Sid} environmentSid the environment to retrieve
 * @param {Sid} serviceSid the service the environment belongs to
 * @param {GotClient} client API client
 * @returns {Promise<EnvironmentResource>}
 */
export async function getEnvironment(
  environmentSid: Sid,
  serviceSid: Sid,
  client: GotClient
): Promise<EnvironmentResource> {
  const resp = await client.get(
    `/Services/${serviceSid}/Environments/${environmentSid}`
  );
  return (resp.body as unknown) as EnvironmentResource;
}

/**
 * Creates a new environment given a domain suffix
 *
 * @export
 * @param {string} domainSuffix the domain suffix for the environment
 * @param {string} serviceSid the service to create the environment for
 * @param {GotClient} client API client
 * @returns {Promise<EnvironmentResource>}
 */
export async function createEnvironmentFromSuffix(
  domainSuffix: string,
  serviceSid: string,
  client: GotClient
): Promise<EnvironmentResource> {
  const uniqueName = getUniqueNameFromSuffix(domainSuffix);
  const resp = await client.post(`/Services/${serviceSid}/Environments`, {
    form: true,
    body: {
      UniqueName: uniqueName,
      DomainSuffix: domainSuffix,
      FriendlyName: `${uniqueName} Environment (Created by CLI)`,
    },
  });
  return (resp.body as unknown) as EnvironmentResource;
}

/**
 * Lists all environments for a given service
 *
 * @export
 * @param {string} serviceSid the service that the environments belong to
 * @param {GotClient} client API client
 * @returns
 */
export async function listEnvironments(serviceSid: string, client: GotClient) {
  const resp = await client.get(`/Services/${serviceSid}/Environments`);
  const content = (resp.body as unknown) as EnvironmentList;
  return content.environments;
}

/**
 * Looks up an environment given a domain suffix.
 *
 * @export
 * @param {string} domainSuffix the suffix to look for
 * @param {string} serviceSid the service the environment belongs to
 * @param {GotClient} client API client
 * @returns {Promise<EnvironmentResource>}
 */
export async function getEnvironmentFromSuffix(
  domainSuffix: string,
  serviceSid: string,
  client: GotClient
): Promise<EnvironmentResource> {
  const environments = await listEnvironments(serviceSid, client);
  let foundEnvironments = environments.filter(
    e => e.domain_suffix === domainSuffix
  );

  let env: EnvironmentResource | undefined;
  if (foundEnvironments.length > 1) {
    // this is an edge case where at one point you could create environments with the same domain suffix
    env = foundEnvironments.find(
      e => e.domain_suffix === domainSuffix && e.unique_name === domainSuffix
    );
  } else {
    env = foundEnvironments[0];
  }

  if (!env) {
    // in the past the unique_name was set as `{domainSuffix}-environment`
    env = findLegacyEnvironments(environments, domainSuffix);
    if (!env) {
      throw new Error('Could not find environment');
    }
  }
  return env;
}

/**
 * Creates an environment if non with the given suffix exists
 *
 * @export
 * @param {string} domainSuffix the domain suffix of the environment
 * @param {string} serviceSid the service the environment belongs to
 * @param {GotClient} client API client
 * @returns
 */
export async function createEnvironmentIfNotExists(
  domainSuffix: string,
  serviceSid: string,
  client: GotClient
) {
  return getEnvironmentFromSuffix(domainSuffix, serviceSid, client).catch(
    err => {
      try {
        return createEnvironmentFromSuffix(domainSuffix, serviceSid, client);
      } catch (err) {
        log('%O', err);
        throw err;
      }
    }
  );
}
