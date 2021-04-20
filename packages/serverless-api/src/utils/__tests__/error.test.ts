import nock from 'nock';
import util from 'util';
import { AccountSidConfig, UsernameConfig } from '../../../dist';
import { createGotClient } from '../../client';
import {
  DEFAULT_TEST_CLIENT_CONFIG,
  DEFAULT_TEST_CLIENT_CONFIG_USERNAME_PASSWORD,
} from '../../__fixtures__/base-fixtures';
import { ClientApiError } from '../error';

describe('ClientApiError', () => {
  let apiNock = nock('https://serverless.twilio.com');
  let config:
    | UsernameConfig
    | AccountSidConfig = DEFAULT_TEST_CLIENT_CONFIG_USERNAME_PASSWORD;
  let apiClient = createGotClient(config);

  beforeEach(() => {
    apiNock = nock('https://serverless.twilio.com');
    config = DEFAULT_TEST_CLIENT_CONFIG_USERNAME_PASSWORD;
    apiClient = createGotClient(config);
  });

  test('wraps error correctly', async () => {
    const scope = apiNock.get('/v1/Services').reply(400, {
      code: 20001,
      message: 'Services are limited to less than or equal to 9000',
      more_info: 'https://www.twilio.com/docs/errors/20001',
      status: 400,
    });

    try {
      const resp = await apiClient.get('Services');
    } catch (err) {
      const newError = new ClientApiError(err);
      expect(err).toBeDefined();
      expect(newError).toBeInstanceOf(ClientApiError);
      expect(newError.name).toBe('TwilioApiError');
    }
  });

  test('does not contain any auth tokens', async () => {
    const scope = apiNock.get('/v1/Services').reply(400, {
      code: 20001,
      message: 'Services are limited to less than or equal to 9000',
      more_info: 'https://www.twilio.com/docs/errors/20001',
      status: 400,
    });

    config = DEFAULT_TEST_CLIENT_CONFIG;
    apiClient = createGotClient(config);

    try {
      const resp = await apiClient.get('Services');
    } catch (err) {
      const newError = new ClientApiError(err);
      const stringVersion = util.inspect(newError);
      expect(stringVersion.includes(config.authToken)).toBe(false);
    }
  });

  test('does not contain any password', async () => {
    const scope = apiNock.get('/v1/Services').reply(400, {
      code: 20001,
      message: 'Services are limited to less than or equal to 9000',
      more_info: 'https://www.twilio.com/docs/errors/20001',
      status: 400,
    });

    try {
      const resp = await apiClient.get('Services');
    } catch (err) {
      const newError = new ClientApiError(err);
      const stringVersion = util.inspect(newError);
      expect(stringVersion.includes((config as UsernameConfig).password)).toBe(
        false
      );
    }
  });

  test('contains URL and status code for basic HTTP Errors', async () => {
    const scope = apiNock.get('/v1/Services/ZS1111').reply(404, {});

    try {
      const resp = await apiClient.get('Services/ZS1111');
    } catch (err) {
      const newError = new ClientApiError(err);
      const expectedUrl = 'https://serverless.twilio.com/v1/Services/ZS1111';
      expect(newError.code).toEqual(404);
      expect(newError.url).toEqual(expectedUrl);

      const stringVersion = util.inspect(newError);
      expect(stringVersion.includes(expectedUrl)).toBe(true);
      expect(stringVersion.includes('404')).toBe(true);
    }
  });

  test('contains URL and API code for Twilio API Errrors', async () => {
    const scope = apiNock.get('/v1/Services/ZS1111').reply(400, {
      code: 20001,
      message: 'Services are limited to less than or equal to 9000',
      more_info: 'https://www.twilio.com/docs/errors/20001',
      status: 400,
    });

    try {
      const resp = await apiClient.get('Services/ZS1111');
    } catch (err) {
      const newError = new ClientApiError(err);
      const expectedUrl = 'https://serverless.twilio.com/v1/Services/ZS1111';
      expect(newError.code).toEqual(20001);
      expect(newError.url).toEqual(expectedUrl);

      const stringVersion = util.inspect(newError);
      expect(stringVersion.includes(expectedUrl)).toBe(true);
      expect(stringVersion.includes('20001')).toBe(true);
    }
  });
});
