import debug from 'debug';
import { ServiceList, ServiceResource } from '../serverless-api-types';
import { GotClient } from '../types';

const log = debug('twilio-serverless-api/client');

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

export async function findServiceSid(
  projectName: string,
  client: GotClient
): Promise<string | null> {
  try {
    const resp = await client.get('/Services');
    const { services } = (resp.body as unknown) as ServiceList;
    for (let service of services) {
      if (service.unique_name === projectName) {
        return service.sid;
      }
    }
  } catch (err) {
    log('%O', err);
    throw err;
  }
  return null;
}
