import nock from 'nock';
import { UsernameConfig } from '../../';
import { getPaginatedResource } from '../api/utils/pagination';
import TwilioServerlessApiClient from '../client';
import { DEFAULT_TEST_CLIENT_CONFIG_USERNAME_PASSWORD } from '../__fixtures__/base-fixtures';

jest.mock('os', () => {
  const originalOS = jest.requireActual('os');
  const osMock = jest.requireActual('../../__mocks__/os').default;
  return {
    ...originalOS,
    ...osMock,
  };
});
jest.mock('../utils/package-info');

const DEFAULT_USER_AGENT = `@twilio-labs/serverless-api-test/1.0.0-test (darwin-mock x64-mock) node/${process.version}`;
const DEFAULT_CREDENTIALS = {
  user: DEFAULT_TEST_CLIENT_CONFIG_USERNAME_PASSWORD.username,
  pass: DEFAULT_TEST_CLIENT_CONFIG_USERNAME_PASSWORD.password,
};

const DEFAULT_HEADERS = {
  'user-agent': DEFAULT_USER_AGENT,
  accept: 'application/json',
  'accept-encoding': 'gzip, deflate, br',
};

describe('API integration tests', () => {
  let apiNock: nock.Scope,
    config: UsernameConfig,
    apiClient: TwilioServerlessApiClient;
  beforeAll(() => {
    nock.disableNetConnect();
  });

  beforeEach(() => {
    apiNock = nock('https://serverless.twilio.com', {
      reqheaders: DEFAULT_HEADERS,
    });
    config = DEFAULT_TEST_CLIENT_CONFIG_USERNAME_PASSWORD;
    apiClient = new TwilioServerlessApiClient(config);
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  describe('basic requests', () => {
    test('handles get requests', async () => {
      const scope = apiNock
        .get('/v1/Services')
        .basicAuth(DEFAULT_CREDENTIALS)
        .reply(200, { services: [] });

      await apiClient.request('get', 'Services');
      scope.done();
    });

    test('handles post request', async () => {
      const scope = apiNock
        .post('/v1/Services', 'UniqueName=test-app')
        .basicAuth(DEFAULT_CREDENTIALS)
        .reply(200, {});
      await apiClient.request('post', 'Services', {
        form: {
          UniqueName: 'test-app',
        },
      });

      scope.done();
    });

    test('handles delete request', async () => {
      const scope = apiNock
        .delete('/v1/Services/ZS11111111111111111111111111111111')
        .basicAuth(DEFAULT_CREDENTIALS)
        .reply(200, {});

      await apiClient.request(
        'delete',
        'Services/ZS11111111111111111111111111111111'
      );
      scope.done();
    });

    test('passes user-agent extensions', async () => {
      apiNock = nock('https://serverless.twilio.com', {
        reqheaders: {
          ...DEFAULT_HEADERS,
          'user-agent':
            DEFAULT_USER_AGENT +
            ' twilio-run/1.0.0-test plugin-serverless/1.2.0-test',
        },
      });
      config = DEFAULT_TEST_CLIENT_CONFIG_USERNAME_PASSWORD;
      apiClient = new TwilioServerlessApiClient({
        ...config,
        userAgentExtensions: [
          'twilio-run/1.0.0-test',
          'plugin-serverless/1.2.0-test',
        ],
      });

      const scope = apiNock
        .get('/v1/Services')
        .basicAuth(DEFAULT_CREDENTIALS)
        .reply(200, { services: [] });

      await apiClient.request('get', 'Services');
      scope.done();
    });
  });

  describe('paginated requests', () => {
    const BASE_PAGE_URL =
      'https://serverless.twilio.com/v1/Services?PageSize=50&Page=';
    const BASE_PAGE_INFO = {
      first_page_url: BASE_PAGE_URL + '0',
      key: 'services',
      next_page_url: null,
      page_size: 50,
      previous_page_url: null,
      url: BASE_PAGE_URL,
    };
    const EXAMPLE_SERVICES = [
      { sid: 'ZS11111111111111111111111111111111' },
      { sid: 'ZS11111111111111111111111111111112' },
      { sid: 'ZS11111111111111111111111111111113' },
    ];

    test('handles single page', async () => {
      apiNock
        .get('/v1/Services')
        .basicAuth(DEFAULT_CREDENTIALS)
        .reply(200, { services: [EXAMPLE_SERVICES[0]], meta: BASE_PAGE_INFO });

      const resp = await getPaginatedResource(apiClient, 'Services');
      expect(resp.length).toEqual(1);
    });

    test('handles multi page requests', async () => {
      apiNock
        .get('/v1/Services')
        .basicAuth(DEFAULT_CREDENTIALS)
        .reply(200, {
          services: [EXAMPLE_SERVICES[0]],
          meta: { ...BASE_PAGE_INFO, next_page_url: BASE_PAGE_URL + '1' },
        })
        .get('/v1/Services?PageSize=50&Page=1')
        .basicAuth(DEFAULT_CREDENTIALS)
        .reply(200, {
          services: [EXAMPLE_SERVICES[1]],
          meta: {
            ...BASE_PAGE_INFO,
            previous_page_url: BASE_PAGE_URL + '0',
            next_page_url: BASE_PAGE_URL + '2',
          },
        })
        .get('/v1/Services?PageSize=50&Page=2')
        .basicAuth(DEFAULT_CREDENTIALS)
        .reply(200, { services: [EXAMPLE_SERVICES[2]], meta: BASE_PAGE_INFO });

      const resp = await getPaginatedResource(apiClient, 'Services');
      expect(resp.length).toEqual(3);
    });
  });
});
