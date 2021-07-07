import { getUserAgent } from '../user-agent';

jest.mock('../package-info', () => {
  return {
    name: '@twilio-labs/serverless-api-test',
    version: '1.0.0-test',
  };
});

jest.mock('os', () => {
  return {
    platform: () => 'darwin',
    arch: () => 'x64',
  };
});

const nodeVersion = process.version;

describe('getUserAgent', () => {
  test('should return the right base information', () => {
    expect(getUserAgent()).toEqual(
      `@twilio-labs/serverless-api-test/1.0.0-test (darwin x64) node/${nodeVersion}`
    );
  });

  test('adds extensions and correctly resets extensions', () => {
    expect(
      getUserAgent([
        'twilio-run/2.0.0-test',
        '@twilio-labs/plugin-serverless/1.1.0-test',
      ])
    ).toEqual(
      `@twilio-labs/serverless-api-test/1.0.0-test (darwin x64) node/${nodeVersion} twilio-run/2.0.0-test @twilio-labs/plugin-serverless/1.1.0-test`
    );
    expect(getUserAgent()).toEqual(
      `@twilio-labs/serverless-api-test/1.0.0-test (darwin x64) node/${nodeVersion}`
    );
  });
});
