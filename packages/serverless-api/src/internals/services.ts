import debug from 'debug';
import { GotClient, ServiceList, ServiceResource } from '../types';

const log = debug('twilio-serverless-api:services');

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

export async function listServices(
  client: GotClient
): Promise<ServiceResource[]> {
  const resp = await client.get('/Services');
  const { services } = (resp.body as unknown) as ServiceList;
  return services;
}

export async function findServiceSid(
  projectName: string,
  client: GotClient
): Promise<string | undefined> {
  try {
    const services = await listServices(client);
    for (let service of services) {
      if (service.unique_name === projectName) {
        return service.sid;
      }
    }
  } catch (err) {
    log('%O', err);
    throw err;
  }
  return undefined;
}
