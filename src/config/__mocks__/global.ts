const mod = jest.requireActual('../global');

let _config = {};

export function _setConfig(config: {}) {
  _config = config;
}

export const readSpecializedConfig = jest.fn(() => {
  return _config;
});

export const mergeFlagsAndConfig = jest.fn((mod as any).mergeFlagsAndConfig);
