import { DEFAULT_TEST_CLIENT_CONFIG } from '../../../__fixtures__/base-fixtures';
import { getApiUrl } from '../api-client';

describe('getApiUrl', () => {
  beforeEach(() => {
    delete process.env.TWILIO_EDGE;
    delete process.env.TWILIO_REGION;
  });

  test('returns base URL with standard options', () => {
    const url = getApiUrl(DEFAULT_TEST_CLIENT_CONFIG);
    expect(url).toBe('https://serverless.twilio.com/v1');
  });

  test('handles different product base urls', () => {
    const url = getApiUrl(DEFAULT_TEST_CLIENT_CONFIG, 'serverless-upload');
    expect(url).toBe('https://serverless-upload.twilio.com/v1');
  });

  test('works with region config', () => {
    const url = getApiUrl({ ...DEFAULT_TEST_CLIENT_CONFIG, region: 'dev' });
    expect(url).toBe('https://serverless.dev.twilio.com/v1');
  });

  test('works with region config and a product', () => {
    const url = getApiUrl(
      { ...DEFAULT_TEST_CLIENT_CONFIG, region: 'dev' },
      'serverless-upload'
    );
    expect(url).toBe('https://serverless-upload.dev.twilio.com/v1');
  });

  test('works with edge config', () => {
    const url = getApiUrl({ ...DEFAULT_TEST_CLIENT_CONFIG, edge: 'sydney' });
    expect(url).toBe('https://serverless.sydney.twilio.com/v1');
  });

  test('works with region and edge config', () => {
    const url = getApiUrl({
      ...DEFAULT_TEST_CLIENT_CONFIG,
      edge: 'sydney',
      region: 'au1',
    });
    expect(url).toBe('https://serverless.sydney.au1.twilio.com/v1');
  });

  test('works with region env variable', () => {
    process.env.TWILIO_REGION = 'stage';
    const url = getApiUrl(DEFAULT_TEST_CLIENT_CONFIG);
    expect(url).toBe('https://serverless.stage.twilio.com/v1');
  });

  test('works with edge env variable', () => {
    process.env.TWILIO_EDGE = 'sydney';
    const url = getApiUrl(DEFAULT_TEST_CLIENT_CONFIG);
    expect(url).toBe('https://serverless.sydney.twilio.com/v1');
  });

  test('works with region & edge env variable', () => {
    process.env.TWILIO_EDGE = 'sydney';
    process.env.TWILIO_REGION = 'au2';
    const url = getApiUrl(DEFAULT_TEST_CLIENT_CONFIG);
    expect(url).toBe('https://serverless.sydney.au2.twilio.com/v1');
  });
});
