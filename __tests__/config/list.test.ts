import { getConfigFromFlags, ListCliFlags } from '../../src/config/list';

jest.mock('../../src/config/global');
jest.mock('../../src/config/utils/mergeFlagsAndConfig');
jest.mock('../../src/config/utils');

const baseFlags = {
  types: 'services',
  extendedOutput: false,
  environment: 'dev',
} as ListCliFlags;

describe('getConfigFromFlags', () => {
  test('should return a config', async () => {
    const flags = { ...baseFlags };
    const config = await getConfigFromFlags(flags);
    expect(config).toBeDefined();
  });

  describe('handle types', () => {
    test('should split types into an array', async () => {
      const flags = { ...baseFlags };
      const config = await getConfigFromFlags(flags);
      expect(config.types).toEqual(['services']);
    });

    test('should split types by comma and trim', async () => {
      const flags = { ...baseFlags, types: 'environments, functions' };
      const config = await getConfigFromFlags(flags);
      expect(config.types).toEqual(['environments', 'functions']);
    });
  });

  test('should call the right functions', async () => {
    const globalMod = require('../../src/config/global');
    const utilMod = require('../../src/config/utils');
    const config = await getConfigFromFlags({ ...baseFlags });
    expect(globalMod.readSpecializedConfig).toHaveBeenCalled();
    expect(utilMod.getServiceNameFromFlags).toHaveBeenCalled();
    expect(utilMod.getCredentialsFromFlags).toHaveBeenCalled();
  });
});
