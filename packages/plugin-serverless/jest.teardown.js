const { join } = require('path');
const { tmpdir } = require('os');
const rimraf = require('rimraf');

module.exports = () => {
  rimraf.sync(join(tmpdir(), 'scratch'));
};
