const mod = jest.requireActual('../mergeFlagsAndConfig');

export const mergeFlagsAndConfig = jest
  .fn()
  .mockImplementation(mod.mergeFlagsAndConfig);
