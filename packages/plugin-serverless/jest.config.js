const base = require('../../jest.config.base.js');
const { join } = require('path');

module.exports = {
  ...base,
  preset: null,
  name: 'plugin-serverless',
  displayName: 'plugin-serverless',
  globalTeardown: join(__dirname, 'jest.teardown.js'),
};
