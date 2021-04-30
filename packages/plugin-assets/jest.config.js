const base = require('../../jest.config.base.js');
const { join } = require('path');

module.exports = {
  ...base,
  preset: null,
  name: 'plugin-assets',
  displayName: 'plugin-assets',
  globalTeardown: join(__dirname, 'jest.teardown.js'),
};
