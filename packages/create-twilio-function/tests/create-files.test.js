const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const rimraf = require('rimraf');
const os = require('os');

const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const versions = require('../src/create-twilio-function/versions');
const {
  createPackageJSON,
  createDirectory,
  createExampleFromTemplates,
  createEnvFile,
  createNvmrcFile,
  createTsconfigFile,
  createEmptyFileStructure,
  createServerlessConfigFile,
} = require('../src/create-twilio-function/create-files');

function setupDir() {
  const dirPath = fs.mkdtempSync(
    path.join(os.tmpdir(), 'test-twilio-run-files-')
  );
  return {
    tmpDir: dirPath,
    cleanUp() {
      rimraf.sync(dirPath);
    },
  };
}

describe('create-files', () => {
  describe('createDirectory', () => {
    test('it creates a new directory with the project name', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-dir';
      try {
        await createDirectory(scratchDir, name);
      } catch (err) {
        console.error(err);
      }
      const dir = await stat(path.join(scratchDir, name));
      expect(dir.isDirectory());
      cleanUp();
    });

    test('it throws an error if the directory exists', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-dir-2';
      fs.mkdirSync(path.join(scratchDir, name), { recursive: true });
      expect.assertions(1);
      try {
        await createDirectory(scratchDir, name);
      } catch (e) {
        expect(e.toString()).toMatch('EEXIST');
      }
      cleanUp();
    });
  });

  describe('createPackageJSON', () => {
    test('it creates a new package.json file with the name of the project', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-pkg-1';
      const basePath = path.join(scratchDir, name);
      fs.mkdirSync(basePath, { recursive: true });
      await createPackageJSON(basePath, 'project-name');
      const file = await stat(path.join(basePath, 'package.json'));
      expect(file.isFile());
      const packageJSON = JSON.parse(
        fs.readFileSync(path.join(basePath, 'package.json'), 'utf-8')
      );
      expect(packageJSON.name).toEqual('project-name');
      expect(packageJSON.engines.node).toEqual(versions.node);
      expect(packageJSON.devDependencies['twilio-run']).toEqual(
        versions.twilioRun
      );
      expect(packageJSON.dependencies['@twilio/runtime-handler']).toEqual(
        versions.twilioRuntimeHandler
      );
      expect(packageJSON.dependencies['twilio']).toEqual(versions.twilio);
      cleanUp();
    });

    test('it creates a package.json file with typescript dependencies', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-pkg-2';
      const basePath = path.join(scratchDir, name);
      fs.mkdirSync(basePath, { recursive: true });
      await createPackageJSON(basePath, 'project-name', 'typescript');
      const file = await stat(path.join(basePath, 'package.json'));
      expect(file.isFile());
      const packageJSON = JSON.parse(
        fs.readFileSync(path.join(basePath, 'package.json'), 'utf-8')
      );
      expect(packageJSON.name).toEqual('project-name');
      expect(packageJSON.engines.node).toEqual(versions.node);
      expect(packageJSON.devDependencies['twilio-run']).toEqual(
        versions.twilioRun
      );
      expect(packageJSON.devDependencies.typescript).toEqual(
        versions.typescript
      );
      expect(packageJSON.dependencies['@twilio/runtime-handler']).toEqual(
        versions.twilioRuntimeHandler
      );
      expect(
        packageJSON.dependencies['@twilio-labs/serverless-runtime-types']
      ).toEqual(versions.serverlessRuntimeTypes);
      expect(packageJSON.dependencies['twilio']).toEqual(versions.twilio);
      cleanUp();
    });
    test('it rejects if there is already a package.json', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      fs.closeSync(fs.openSync(path.join(scratchDir, 'package.json'), 'w'));
      expect.assertions(1);
      try {
        await createPackageJSON(scratchDir, 'project-name');
      } catch (e) {
        expect(e.toString()).toMatch('file already exists');
      }
      cleanUp();
    });
  });

  describe('createExampleFromTemplates', () => {
    describe('javascript', () => {
      const templatesDir = path.join(
        __dirname,
        '..',
        'templates',
        'javascript'
      );
      test('it creates functions and assets directories', async () => {
        const { tmpDir: scratchDir, cleanUp } = setupDir();
        const name = 'test-js-template';
        fs.mkdirSync(path.join(scratchDir, name), { recursive: true });
        await createExampleFromTemplates(path.join(scratchDir, name));

        const dirs = await readdir(path.join(scratchDir, name));
        const templateDirContents = await readdir(templatesDir);
        expect(dirs).toEqual(templateDirContents);
        cleanUp();
      });

      test('it copies the functions from the templates/javascript/functions directory', async () => {
        const { tmpDir: scratchDir, cleanUp } = setupDir();
        const name = 'test-js-template-1';
        fs.mkdirSync(path.join(scratchDir, name), { recursive: true });
        await createExampleFromTemplates(path.join(scratchDir, name));

        const functions = await readdir(
          path.join(scratchDir, name, 'functions')
        );
        const templateFunctions = await readdir(
          path.join(templatesDir, 'functions')
        );
        expect(functions).toEqual(templateFunctions);
        cleanUp();
      });

      test('it rejects if there is already a functions directory', async () => {
        const { tmpDir: scratchDir, cleanUp } = setupDir();
        const name = 'test-js-template-2';
        fs.mkdirSync(path.join(scratchDir, name, 'functions'), {
          recursive: true,
        });
        expect.assertions(1);
        try {
          await createExampleFromTemplates(path.join(scratchDir, name));
        } catch (e) {
          expect(e.toString()).toMatch('file already exists');
        }
        cleanUp();
      });
    });
    describe('typescript', () => {
      const templatesDir = path.join(
        __dirname,
        '..',
        'templates',
        'typescript'
      );
      test('it creates functions and assets directories', async () => {
        const { tmpDir: scratchDir, cleanUp } = setupDir();
        const name = 'test-ts-template';
        fs.mkdirSync(path.join(scratchDir, name), { recursive: true });
        await createExampleFromTemplates(
          path.join(scratchDir, name),
          'typescript'
        );

        const dirs = await readdir(path.join(scratchDir, name));
        const templateDirContents = await readdir(templatesDir);
        expect(dirs).toEqual(templateDirContents);
        cleanUp();
      });

      test('it copies the typescript files from the templates/typescript/src directory', async () => {
        const { tmpDir: scratchDir, cleanUp } = setupDir();
        const name = 'test-ts-template-1';
        fs.mkdirSync(path.join(scratchDir, name), { recursive: true });
        await createExampleFromTemplates(
          path.join(scratchDir, name),
          'typescript'
        );

        const src = await readdir(path.join(scratchDir, name, 'src'));
        const templateSrc = await readdir(path.join(templatesDir, 'src'));
        expect(src).toEqual(templateSrc);
        cleanUp();
      });

      test('it rejects if there is already a src directory', async () => {
        const { tmpDir: scratchDir, cleanUp } = setupDir();
        const name = 'test-ts-template-2';
        fs.mkdirSync(path.join(scratchDir, name, 'src'), { recursive: true });
        expect.assertions(1);
        try {
          await createExampleFromTemplates(
            path.join(scratchDir, name),
            'typescript'
          );
        } catch (e) {
          expect(e.toString()).toMatch('file already exists');
        }
        cleanUp();
      });
    });
  });

  describe('createEnvFile', () => {
    test('it creates a new .env file', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-env-1';
      const basePath = path.join(scratchDir, name);
      fs.mkdirSync(basePath, { recursive: true });
      await createEnvFile(basePath, {
        accountSid: 'AC123',
        authToken: 'qwerty123456',
      });
      const file = await stat(path.join(basePath, '.env'));
      expect(file.isFile());
      const contents = fs.readFileSync(path.join(basePath, '.env'), {
        encoding: 'utf-8',
      });
      expect(contents).toMatch('ACCOUNT_SID=AC123');
      expect(contents).toMatch('AUTH_TOKEN=qwerty123456');
      cleanUp();
    });

    test('it rejects if there is already an .env file', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-env-2';
      const basePath = path.join(scratchDir, name);
      fs.mkdirSync(basePath, { recursive: true });

      fs.closeSync(fs.openSync(path.join(basePath, '.env'), 'w'));
      expect.assertions(1);
      try {
        await createEnvFile(basePath, {
          accountSid: 'AC123',
          authToken: 'qwerty123456',
        });
      } catch (e) {
        expect(e.toString()).toMatch('file already exists');
      }
      cleanUp();
    });
  });

  describe('createNvmrcFile', () => {
    test('it creates a new .nvmrc file', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-nvmrc-1';
      const basePath = path.join(scratchDir, name);
      fs.mkdirSync(basePath, { recursive: true });

      await createNvmrcFile(basePath);
      const file = await stat(path.join(basePath, '.nvmrc'));
      expect(file.isFile());
      const contents = fs.readFileSync(path.join(basePath, '.nvmrc'), {
        encoding: 'utf-8',
      });
      expect(contents).toMatch(versions.node);
      cleanUp();
    });

    test('it rejects if there is already an .nvmrc file', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-nvmrc-2';
      const basePath = path.join(scratchDir, name);
      fs.mkdirSync(basePath, { recursive: true });

      fs.closeSync(fs.openSync(path.join(basePath, '.nvmrc'), 'w'));
      expect.assertions(1);
      try {
        await createNvmrcFile(basePath);
      } catch (e) {
        expect(e.toString()).toMatch('file already exists');
      }
      cleanUp();
    });
  });

  describe('createServerlessConfigFile', () => {
    test('it creates a new .twilioserverlessrc file', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-serverlessrc-1';
      const basePath = path.join(scratchDir, name);
      fs.mkdirSync(basePath, { recursive: true });

      await createServerlessConfigFile(basePath);
      const file = await stat(path.join(basePath, '.twilioserverlessrc'));
      expect(file.isFile());
      const contents = fs.readFileSync(
        path.join(basePath, '.twilioserverlessrc'),
        {
          encoding: 'utf-8',
        }
      );
      expect(contents.startsWith('{')).toBe(true);
      cleanUp();
    });

    test('it does not override if there is already a file', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-serverlessrc-2';
      const basePath = path.join(scratchDir, name);
      fs.mkdirSync(basePath, { recursive: true });

      fs.closeSync(
        fs.openSync(path.join(basePath, '.twilioserverlessrc'), 'w')
      );
      const result = await createServerlessConfigFile(basePath);
      expect(result).toBe(false);

      const contents = fs.readFileSync(
        path.join(basePath, '.twilioserverlessrc'),
        {
          encoding: 'utf-8',
        }
      );
      expect(contents.startsWith('{')).toBe(false);
      cleanUp();
    });
  });

  describe('createTsconfig', () => {
    test('it creates a new tsconfig.json file', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-tsconfig-1';
      const basePath = path.join(scratchDir, name);
      fs.mkdirSync(basePath, { recursive: true });

      await createTsconfigFile(basePath);
      const file = await stat(path.join(basePath, 'tsconfig.json'));
      expect(file.isFile());
      const contents = fs.readFileSync(path.join(basePath, 'tsconfig.json'), {
        encoding: 'utf-8',
      });
      expect(contents).toMatch('"compilerOptions"');
      cleanUp();
    });

    test('it rejects if there is already an tsconfig.json file', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-tsconfig-2';
      const basePath = path.join(scratchDir, name);
      fs.mkdirSync(basePath, { recursive: true });

      fs.closeSync(fs.openSync(path.join(basePath, 'tsconfig.json'), 'w'));
      expect.assertions(1);
      try {
        await createTsconfigFile(basePath);
      } catch (e) {
        expect(e.toString()).toMatch('file already exists');
      }
      cleanUp();
    });
  });

  describe('createEmptyFileStructure', () => {
    test('creates functions and assets directory for javascript', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-empty-1';
      const basePath = path.join(scratchDir, name);
      fs.mkdirSync(basePath, { recursive: true });

      await createEmptyFileStructure(basePath, 'javascript');
      const functions = await stat(path.join(basePath, 'functions'));
      expect(functions.isDirectory());
      const assets = await stat(path.join(basePath, 'assets'));
      expect(assets.isDirectory());
      cleanUp();
    });

    test('creates src, functions and assets directory for typescript', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-empty-2';
      const basePath = path.join(scratchDir, name);
      fs.mkdirSync(basePath, { recursive: true });

      await createEmptyFileStructure(basePath, 'typescript');
      const src = await stat(path.join(basePath, 'src'));
      expect(src.isDirectory());
      const functions = await stat(path.join(basePath, 'src', 'functions'));
      expect(functions.isDirectory());
      const assets = await stat(path.join(basePath, 'src', 'assets'));
      expect(assets.isDirectory());
      cleanUp();
    });
  });
});
