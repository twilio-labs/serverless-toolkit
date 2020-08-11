const path = require('path');
const os = require('os');
const rimraf = require('rimraf');

module.exports = () => {
  rimraf.sync(path.join(os.tmpdir(), 'test-twilio-run-*'));
};
