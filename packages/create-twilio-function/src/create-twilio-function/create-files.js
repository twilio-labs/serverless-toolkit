const fs = require('fs');
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const open = promisify(fs.open);
const write = promisify(fs.write);

async function createDirectory(path, dirName) {
  return mkdir(path + '/' + dirName).catch(() => {});
}

async function createPackageJSON(path, name) {
  const fullPath = `${path}/package.json`;
  const packageJSON = JSON.stringify({
    name: name,
    version: '0.0.0',
    private: true,
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
      start: 'twilio-run --env'
    },
    devDependencies: {
      'twilio-run': '^1.0.0-beta.4'
    }
  });
  return open(fullPath, 'wx').then(fd => {
    return write(fd, packageJSON);
  });
}

module.exports = { createDirectory, createPackageJSON };
