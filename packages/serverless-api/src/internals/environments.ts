import debug from 'debug';
import { EnvironmentList, EnvironmentResource, GotClient, Sid } from '../types';

const log = debug('twilio-serverless-api:environments');

function getUniqueNameFromSuffix(suffix: string): string {
  return suffix + '-environment';
}

export function isEnvironmentSid(str: string) {
  return str.startsWith('ZE') && str.length === 34;
}

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

export async function createEnvironmentFromSuffix(
  envSuffix: string,
  serviceSid: string,
  client: GotClient
): Promise<EnvironmentResource> {
  const uniqueName = getUniqueNameFromSuffix(envSuffix);
  const resp = await client.post(`/Services/${serviceSid}/Environments`, {
    form: true,
    body: {
      UniqueName: uniqueName,
      DomainSuffix: envSuffix,
    },
  });
  return (resp.body as unknown) as EnvironmentResource;
}

export async function listEnvironments(serviceSid: string, client: GotClient) {
  const resp = await client.get(`/Services/${serviceSid}/Environments`);
  const content = (resp.body as unknown) as EnvironmentList;
  return content.environments;
}

export async function getEnvironmnetFromSuffix(
  envSuffix: string,
  serviceSid: string,
  client: GotClient
): Promise<EnvironmentResource> {
  const uniqueName = getUniqueNameFromSuffix(envSuffix);
  const environments = await listEnvironments(serviceSid, client);
  const env = environments.find(e => e.unique_name === uniqueName);
  if (!env) {
    throw new Error('Could not find environment');
  }
  return env;
}

export async function createEnvironmentIfNotExists(
  envSuffix: string,
  serviceSid: string,
  client: GotClient
) {
  return createEnvironmentFromSuffix(envSuffix, serviceSid, client).catch(
    err => {
      try {
        return getEnvironmnetFromSuffix(envSuffix, serviceSid, client);
      } catch (err) {
        log('%O', err);
        throw err;
      }
    }
  );
}
