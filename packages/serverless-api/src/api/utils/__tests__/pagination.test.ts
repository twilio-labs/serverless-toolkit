import { createGotClient, TwilioServerlessApiClient } from '../../../client';
import { ServiceList, ServiceResource } from '../../../types';
import { getPaginatedResource } from '../pagination';

const client = new TwilioServerlessApiClient({
  accountSid: '',
  authToken: '',
});

const basePath = 'https://serverless.twilio.com';

function createMockServiceResource(
  sid: string,
  uniqueName: string
): ServiceResource {
  return {
    sid: sid,
    account_sid: 'ACxxxxxxxxxxx',
    date_created: new Date().toISOString(),
    date_updated: new Date().toISOString(),
    url: basePath + '/Services/' + sid,
    unique_name: uniqueName,
    friendly_name: uniqueName,
    include_credentials: true,
  };
}

const baseResources: ServiceResource[] = [
  createMockServiceResource('ZS1', 'test1'),
  createMockServiceResource('ZS2', 'test2'),
  createMockServiceResource('ZS3', 'test3'),
];

const baseResult: ServiceList = {
  services: baseResources,
  meta: {
    key: 'services',
    first_page_url: basePath + '/Services',
    next_page_url: null,
    page: 0,
    page_size: 100,
    previous_page_url: null,
    url: basePath + '/Services',
  },
};

describe('pagination', () => {
  beforeEach(() => {
    client.request = jest.fn();
  });

  test('should return the results', async () => {
    client.request = jest
      .fn()
      .mockReturnValue(Promise.resolve({ body: baseResult }));

    const results = await getPaginatedResource<ServiceList, ServiceResource>(
      client,
      '/Services'
    );

    expect(client.request).toHaveBeenCalledTimes(1);
    expect(results.length).toBe(3);
    expect(results[0].sid).toBe('ZS1');
    expect(results[1].sid).toBe('ZS2');
    expect(results[2].sid).toBe('ZS3');
  });

  test('should paginate over the results', async () => {
    const responseBody = { ...baseResult };
    responseBody.meta.next_page_url = 'https://next-page-url';
    let pagesAvailable = 5;
    let idx = 0;
    client.request = jest.fn().mockImplementation(() => {
      const resp = { body: { ...baseResult } };
      if (pagesAvailable > 1) {
        resp.body.meta.next_page_url = 'https://next-page-url';
        pagesAvailable--;
      } else {
        resp.body.meta.next_page_url = null;
      }
      resp.body.services = [
        createMockServiceResource(`ZS${idx++}`, 'demo-' + idx),
      ];

      return Promise.resolve(resp);
    });

    const results = await getPaginatedResource<ServiceList, ServiceResource>(
      client,
      '/Services'
    );

    expect(client.request).toHaveBeenCalledTimes(5);
    expect(results.length).toBe(5);
    expect(results[0].sid).toBe('ZS0');
    expect(results[1].sid).toBe('ZS1');
    expect(results[2].sid).toBe('ZS2');
    expect(results[3].sid).toBe('ZS3');
    expect(results[4].sid).toBe('ZS4');
  });

  test('should forward error on first try', async () => {
    const err = new Error('Test Error');
    client.request = jest.fn().mockImplementation(() => {
      throw err;
    });

    try {
      const results = await getPaginatedResource<ServiceList, ServiceResource>(
        client,
        '/Services'
      );
    } catch (e) {
      expect(e.message).toBe('Test Error');
    }
  });

  test('should ignore error on consec. requests', async () => {
    const err = new Error('Test Error');
    let shouldThrow = false;
    client.request = jest.fn().mockImplementation(() => {
      if (shouldThrow) {
        throw err;
      } else {
        const response = { ...baseResult };
        response.meta.next_page_url = 'https://next-page-url';
        shouldThrow = true;
        return Promise.resolve({ body: response });
      }
    });

    const results = await getPaginatedResource<ServiceList, ServiceResource>(
      client,
      '/Services'
    );

    expect(client.request).toHaveBeenCalledTimes(2);
    expect(results.length).toBe(3);
    expect(results[0].sid).toBe('ZS1');
    expect(results[1].sid).toBe('ZS2');
    expect(results[2].sid).toBe('ZS3');
  });
});
