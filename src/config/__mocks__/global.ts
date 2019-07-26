let _config = {};

export function _setConfig(config: {}) {
  _config = config;
}

export const readSpecializedConfig = jest.fn(() => {
  return _config;
});
