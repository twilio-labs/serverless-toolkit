const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
    },
  },
  name: 'runtime-handler',
  displayName: 'runtime-handler',
};
