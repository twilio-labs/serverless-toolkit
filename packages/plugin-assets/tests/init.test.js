jest.mock('@twilio-labs/serverless-api/dist/api/services', () => {
  return { createService: jest.fn().mockResolvedValue('new-service-sid') };
});
jest.mock('@twilio-labs/serverless-api/dist/api/environments', () => {
  return {
    createEnvironmentFromSuffix: jest
      .fn()
      .mockResolvedValue({ sid: 'new-environment-sid' }),
    getEnvironment: jest
      .fn()
      .mockResolvedValue({ domain_name: 'foobar-1234-stage.twil.io' }),
  };
});

const { init } = require('../src/init');
const path = require('path');
const fs = require('fs').promises;
const { tmpdir } = require('os');

const {
  createService,
} = require('@twilio-labs/serverless-api/dist/api/services');
const {
  createEnvironmentFromSuffix,
  getEnvironment,
} = require('@twilio-labs/serverless-api/dist/api/environments');

const mockLogger = {
  error: jest.fn(),
  debug: jest.fn(),
};

describe('init', () => {
  describe('with nothing in the config', () => {
    const fakeConfig = {
      getConfig: jest.fn().mockResolvedValue({}),
      setConfig: jest.fn().mockResolvedValue(),
    };
    it('creates a new service and environment and writes it to config', async () => {
      const result = await init({
        apiKey: 'apiKey',
        apiSecret: 'apiSecret',
        accountSid: 'test-account-sid',
        pluginConfig: fakeConfig,
        logger: mockLogger,
        serviceName: 'test-asset-service',
      });

      expect(createEnvironmentFromSuffix).toHaveBeenCalledTimes(1);
      expect(createService).toHaveBeenCalledTimes(1);
      expect(getEnvironment).not.toHaveBeenCalled();
      expect(fakeConfig.getConfig).toHaveBeenCalledTimes(1);
      expect(fakeConfig.setConfig).toHaveBeenCalledTimes(1);
      expect(fakeConfig.setConfig).toHaveBeenCalledWith({
        'test-account-sid': {
          serviceSid: 'new-service-sid',
          environmentSid: 'new-environment-sid',
        },
      });
      expect(result.sid).toBe('new-environment-sid');
    });
  });

  describe('with a service sid and environment sid in the config', () => {
    const fakeConfig = {
      getConfig: jest.fn().mockResolvedValue({
        'test-account-sid': {
          serviceSid: 'old-service-sid',
          environmentSid: 'old-environment-sid',
        },
      }),
      setConfig: jest.fn().mockResolvedValue(),
    };

    it('displays the environment domain name', async () => {
      const result = await init({
        apiKey: 'apiKey',
        apiSecret: 'apiSecret',
        accountSid: 'test-account-sid',
        pluginConfig: fakeConfig,
        logger: mockLogger,
      });

      expect(fakeConfig.getConfig).toHaveBeenCalledTimes(1);
      expect(fakeConfig.setConfig).not.toHaveBeenCalled();
      expect(getEnvironment).toHaveBeenCalledTimes(1);
      expect(getEnvironment).toHaveBeenCalledWith(
        'old-environment-sid',
        'old-service-sid',
        expect.anything() // client
      );
      expect(result.domain_name).toBe('foobar-1234-stage.twil.io');
      expect(createEnvironmentFromSuffix).not.toHaveBeenCalled();
      expect(createService).not.toHaveBeenCalled();
    });
  });
});
