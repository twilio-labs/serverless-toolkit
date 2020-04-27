import nock from 'nock';
import util from 'util';
import { createGotClient } from '../../client';
import { ClientApiError } from '../error';
import { ClientConfig } from '../../types';
import { DEFAULT_TEST_CLIENT_CONFIG } from '../../__fixtures__/base-fixtures';

describe('ClientApiError', () => {
  let apiNock = nock('https://serverless.twilio.com');
  let config: ClientConfig = DEFAULT_TEST_CLIENT_CONFIG;
  let apiClient = createGotClient(config);

  beforeEach(() => {
    apiNock = nock('https://serverless.twilio.com');
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

    try {
      const resp = await apiClient.get('Services');
    } catch (err) {
      const newError = new ClientApiError(err);
      const stringVersion = util.inspect(newError);
      expect(stringVersion).not.toContain(config.authToken);
    }
  });
});
