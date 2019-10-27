const versions = require('./versions');
const fs = require('fs');
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);
const { COPYFILE_EXCL } = fs.constants;
const stat = promisify(fs.stat);
const path = require('path');

function createDirectory(pathName, dirName) {
  return mkdir(path.join(pathName, dirName));
}

async function createFile(fullPath, content) {
  return writeFile(fullPath, content, { flag: 'wx' });
}

function createPackageJSON(pathName, name) {
  const fullPath = path.join(pathName, 'package.json');
  const packageJSON = JSON.stringify(
    {
      name: name,
      version: '0.0.0',
      private: true,
      scripts: {
        test: 'echo "Error: no test specified" && exit 1',
        start: 'twilio-run',
        deploy: 'twilio-run deploy'
      },
      devDependencies: {
        'twilio-run': versions.twilioRun
      },
      engines: { node: versions.node }
    },
    null,
    2
  );
  return createFile(fullPath, packageJSON);
}

function copyRecursively(src, dest) {
  return readdir(src).then(children => {
    return Promise.all(
      children.map(child =>
        stat(path.join(src, child)).then(stat => {
          if (stat.isDirectory()) {
            return mkdir(path.join(dest, child)).then(() =>
              copyRecursively(path.join(src, child), path.join(dest, child))
            );
          }
          return copyFile(
            path.join(src, child),
            path.join(dest, child),
            COPYFILE_EXCL
          );
        })
      )
    );
  });
}

function createExampleFromTemplates(pathName) {
  return copyRecursively(
    path.join(__dirname, '..', '..', 'templates'),
    pathName
  );
}

function createEnvFile(pathName, { accountSid, authToken }) {
  const fullPath = path.join(pathName, '.env');
  const content = `ACCOUNT_SID=${accountSid}
AUTH_TOKEN=${authToken}`;
  return createFile(fullPath, content);
}

function createNvmrcFile(pathName) {
  const fullPath = path.join(pathName, '.nvmrc');
  const content = versions.node;
  return createFile(fullPath, content);
}

module.exports = {
  createDirectory,
  createPackageJSON,
  createExampleFromTemplates,
  createEnvFile,
  createNvmrcFile
};
