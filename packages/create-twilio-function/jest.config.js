const path = require('path');
const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  preset: null,
  name: 'create-twilio-function',
  displayName: 'create-twilio-function',
  globalTeardown: path.join(__dirname, 'jest.teardown.js'),
};
