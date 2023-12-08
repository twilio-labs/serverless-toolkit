const fs = require('fs');
const path = require('path');
const {
  writeDefaultConfigFile,
} = require('twilio-run/dist/templating/defaultConfig');
const { promisify } = require('util');

const versions = require('./versions');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);
const { COPYFILE_EXCL } = fs.constants;
const stat = promisify(fs.stat);

function createDirectory(pathName, dirName) {
  return mkdir(path.join(pathName, dirName));
}

async function createFile(fullPath, content) {
  return writeFile(fullPath, content, { flag: 'wx' });
}

const javaScriptDeps = {
  twilio: versions.twilio,
  '@twilio/runtime-handler': versions.twilioRuntimeHandler,
};
const typescriptDeps = {
  '@twilio-labs/serverless-runtime-types': versions.serverlessRuntimeTypes,
  ...javaScriptDeps,
};
const javaScriptDevDeps = { 'twilio-run': versions.twilioRun };
const typescriptDevDeps = {
  ...javaScriptDevDeps,
  typescript: versions.typescript,
  copyfiles: versions.copyfiles,
};

function createPackageJSON(pathName, name, projectType = 'javascript') {
  const fullPath = path.join(pathName, 'package.json');
  const scripts = {
    test: 'echo "Error: no test specified" && exit 1',
    start: 'twilio-run',
    deploy: 'twilio-run deploy',
  };
  if (projectType === 'typescript') {
    scripts.test = 'tsc --noEmit';
    scripts.build = 'tsc && npm run build:copy-assets';
    scripts['build:copy-assets'] =
      'copyfiles src/assets/* src/assets/**/* --up 2 --exclude **/*.ts dist/assets/';
    scripts.prestart = 'npm run build';
    scripts.predeploy = 'npm run build';
    scripts.start +=
      ' --functions-folder dist/functions --assets-folder dist/assets';
    scripts.deploy +=
      ' --functions-folder dist/functions --assets-folder dist/assets';
  }
  const packageJSON = JSON.stringify(
    {
      name,
      version: '0.0.0',
      private: true,
      scripts,
      dependencies:
        projectType === 'typescript' ? typescriptDeps : javaScriptDeps,
      devDependencies:
        projectType === 'typescript' ? typescriptDevDeps : javaScriptDevDeps,
      engines: { node: versions.node },
    },
    null,
    2
  );
  return createFile(fullPath, packageJSON);
}

function copyRecursively(src, dest) {
  return readdir(src).then((children) => {
    return Promise.all(
      children.map((child) =>
        stat(path.join(src, child)).then((stats) => {
          if (stats.isDirectory()) {
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

function createExampleFromTemplates(pathName, projectType = 'javascript') {
  return copyRecursively(
    path.join(__dirname, '..', '..', 'templates', projectType),
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

function createServerlessConfigFile(pathName) {
  return writeDefaultConfigFile(pathName, false, '.twilioserverlessrc');
}

function createTsconfigFile(pathName) {
  const fullPath = path.join(pathName, 'tsconfig.json');
  return createFile(
    fullPath,
    JSON.stringify(
      {
        compilerOptions: {
          target: 'es2018',
          module: 'commonjs',
          strict: true,
          esModuleInterop: true,
          rootDir: 'src',
          outDir: 'dist',
          skipLibCheck: true,
          sourceMap: true,
          types: ['node'],
        },
        exclude: ['node_modules'],
      },
      null,
      2
    )
  );
}

async function createEmptyFileStructure(pathName, projectType) {
  if (projectType === 'typescript') {
    await createDirectory(pathName, 'src');
    await createDirectory(pathName, path.join('src', 'functions'));
    await createDirectory(pathName, path.join('src', 'assets'));
  } else {
    await createDirectory(pathName, 'functions');
    await createDirectory(pathName, 'assets');
  }
}

module.exports = {
  createDirectory,
  createPackageJSON,
  createExampleFromTemplates,
  createEnvFile,
  createNvmrcFile,
  createServerlessConfigFile,
  createTsconfigFile,
  createEmptyFileStructure,
};
