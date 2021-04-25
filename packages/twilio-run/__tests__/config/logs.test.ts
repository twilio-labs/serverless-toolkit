import { getConfigFromFlags, LogsCliFlags } from '../../src/config/logs';

const baseFlags = {
  $0: 'twilio-run',
  _: ['logs'],
  serviceSid: 'ZS11112222111122221111222211112222',
} as LogsCliFlags;

describe('getConfigFromFlags', () => {
  test('should return a config', async () => {
    const flags = { ...baseFlags };
    const config = await getConfigFromFlags(flags);
    expect(config).toBeDefined();
    expect(config.serviceSid).toBe(baseFlags.serviceSid);
  });

  test('should set environment to "dev" by default', async () => {
    const flags = { ...baseFlags };
    const config = await getConfigFromFlags(flags);
    expect(config.environment).toBe('dev');
  });

  test('should set environment with a flag', async () => {
    const flags = { ...baseFlags, environment: 'stage' };
    const config = await getConfigFromFlags(flags);
    expect(config.environment).toBe('stage');
  });

  test('should set environment to empty string with "production" flag', async () => {
    const flags = { ...baseFlags, production: true };
    const config = await getConfigFromFlags(flags);
    expect(config.environment).toBe('');
  });

  test('production overrides setting environment directly', async () => {
    const flags = { ...baseFlags, production: true, environment: 'stage' };
    const config = await getConfigFromFlags(flags);
    expect(config.environment).toBe('');
  });
});
