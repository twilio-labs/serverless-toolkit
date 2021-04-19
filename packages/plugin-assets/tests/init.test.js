const { init } = require('../src/init');
const path = require('path');
const fs = require('fs/promises');
const { tmpdir } = require('os');
const { equal } = require('assert');

jest.mock('@twilio-labs/serverless-api/dist/api/services', () => {
  return { createService: jest.fn().mockResolvedValue('new-service-sid') };
});
jest.mock('@twilio-labs/serverless-api/dist/api/environments', () => {
  return {
    createEnvironmentFromSuffix: jest
      .fn()
      .mockResolvedValue({ sid: 'new-environment-sid' }),
  };
});

describe('init', () => {
  describe('with nothing in the config', () => {
    it('creates a new service and environment and writes it to config', async () => {
      const configPath = path.join(
        tmpdir(),
        'scratch',
        'plugin-assets-config.json'
      );
      await init({
        apiKey: 'apiKey',
        apiSecret: 'apiSecret',
        accountSid: 'test-account-sid',
        configDir: path.dirname(configPath),
      });

      const config = JSON.parse(
        await fs.readFile(configPath, { encoding: 'utf-8' })
      );
      expect(config['test-account-sid']['serviceSid']).toBe('new-service-sid');
      expect(config['test-account-sid']['environmentSid']).toBe(
        'new-environment-sid'
      );
    });
  });
});
