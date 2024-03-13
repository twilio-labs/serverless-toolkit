const { join } = require('path');
const { tmpdir } = require('os');
const { sync } = require('rimraf');

module.exports = () => {
  sync(join(tmpdir(), 'scratch'));
};
