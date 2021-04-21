const { init } = require('../src/init');
const path = require('path');
const fs = require('fs').promises;
const { tmpdir } = require('os');

const { ConfigStore } = require('../src/configStore');

const {
  createService,
} = require('@twilio-labs/serverless-api/dist/api/services');
const {
  createEnvironmentFromSuffix,
  getEnvironment,
} = require('@twilio-labs/serverless-api/dist/api/environments');

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

const mockLogger = {
  error: jest.fn(),
  debug: jest.fn(),
};

const configPath = path.join(tmpdir(), 'scratch', 'plugin-assets-config.json');

describe('init', () => {
  beforeEach(async () => {
    await fs.mkdir(path.dirname(configPath), { recursive: true });
  });
  afterEach(async () => {
    await fs.unlink(configPath, { force: true });
  });

  describe('with nothing in the config', () => {
    it('creates a new service and environment and writes it to config', async () => {
      const result = await init({
        apiKey: 'apiKey',
        apiSecret: 'apiSecret',
        accountSid: 'test-account-sid',
        configDir: path.dirname(configPath),
        logger: mockLogger,
      });

      const config = JSON.parse(
        await fs.readFile(configPath, { encoding: 'utf-8' })
      );
      expect(config['test-account-sid']['serviceSid']).toBe('new-service-sid');
      expect(config['test-account-sid']['environmentSid']).toBe(
        'new-environment-sid'
      );
      expect(createEnvironmentFromSuffix).toHaveBeenCalledTimes(1);
      expect(createService).toHaveBeenCalledTimes(1);
      expect(getEnvironment).not.toHaveBeenCalled();
      expect(result.sid).toBe('new-environment-sid');
    });
  });

  describe('with a service sid and environment sid in the config', () => {
    beforeAll(() => {
      const configStore = new ConfigStore(path.dirname(configPath));
      configStore.save({
        'test-account-sid': {
          serviceSid: 'old-service-sid',
          environmentSid: 'old-environment-sid',
        },
      });
    });

    it('displays the environment domain name', async () => {
      const result = await init({
        apiKey: 'apiKey',
        apiSecret: 'apiSecret',
        accountSid: 'test-account-sid',
        configDir: path.dirname(configPath),
        logger: mockLogger,
      });

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
