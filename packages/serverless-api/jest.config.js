const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        tsConfig: './tsconfig.test.json',
      },
    ],
  },
  name: 'serverless-api',
  displayName: 'serverless-api',
};
