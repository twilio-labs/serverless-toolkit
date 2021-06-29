import {
  getUserAgent,
  _addCustomUserAgentExtension,
  _resetUserAgentExtensions,
} from '../user-agent';

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

describe('getUserAgent', () => {
  test('should return the right base information', () => {
    expect(getUserAgent()).toEqual(
      '@twilio-labs/serverless-api-test/1.0.0-test (darwin x64)'
    );
  });

  test('adds extensions and correctly resets extensions', () => {
    _addCustomUserAgentExtension('twilio-run/2.0.0-test');
    _addCustomUserAgentExtension('@twilio-labs/plugin-serverless/1.1.0-test');
    expect(getUserAgent()).toEqual(
      '@twilio-labs/serverless-api-test/1.0.0-test (darwin x64) twilio-run/2.0.0-test @twilio-labs/plugin-serverless/1.1.0-test'
    );
    _resetUserAgentExtensions();
    expect(getUserAgent()).toEqual(
      '@twilio-labs/serverless-api-test/1.0.0-test (darwin x64)'
    );
  });
});
