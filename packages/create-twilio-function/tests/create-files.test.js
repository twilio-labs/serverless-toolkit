const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const rimraf = promisify(require('rimraf'));

const mkdir = promisify(fs.mkdir);
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
} = require('../src/create-twilio-function/create-files');

const scratchDir = path.join(process.cwd(), 'scratch');

beforeAll(async () => {
  await rimraf(scratchDir);
});

beforeEach(async () => {
  await mkdir(scratchDir);
});

afterEach(async () => {
  await rimraf(scratchDir);
});

describe('createDirectory', () => {
  test('it creates a new directory with the project name', async () => {
    await createDirectory(scratchDir, 'test-project');
    const dir = await stat(path.join(scratchDir, 'test-project'));
    expect(dir.isDirectory());
  });

  test('it throws an error if the directory exists', async () => {
    await mkdir(path.join(scratchDir, 'test-project'));
    expect.assertions(1);
    try {
      await createDirectory(scratchDir, 'test-project');
    } catch (e) {
      expect(e.toString()).toMatch('EEXIST');
    }
  });
});

describe('createPackageJSON', () => {
  test('it creates a new package.json file with the name of the project', async () => {
    await createPackageJSON(scratchDir, 'project-name');
    const file = await stat(path.join(scratchDir, 'package.json'));
    expect(file.isFile());
    const packageJSON = JSON.parse(await readFile(path.join(scratchDir, 'package.json'), 'utf-8'));
    expect(packageJSON.name).toEqual('project-name');
    expect(packageJSON.engines.node).toEqual(versions.node);
    expect(packageJSON.devDependencies['twilio-run']).toEqual(versions.twilioRun);
  });

  test('it creates a package.json file with typescript dependencies', async () => {
    await createPackageJSON(scratchDir, 'project-name', 'typescript');
    const file = await stat(path.join(scratchDir, 'package.json'));
    expect(file.isFile());
    const packageJSON = JSON.parse(await readFile(path.join(scratchDir, 'package.json'), 'utf-8'));
    expect(packageJSON.name).toEqual('project-name');
    expect(packageJSON.engines.node).toEqual(versions.node);
    expect(packageJSON.devDependencies['twilio-run']).toEqual(versions.twilioRun);
    expect(packageJSON.devDependencies.typescript).toEqual(versions.typescript);
    expect(packageJSON.dependencies['@twilio-labs/serverless-runtime-types']).toEqual(versions.serverlessRuntimeTypes);
  });

  test('it rejects if there is already a package.json', async () => {
    fs.closeSync(fs.openSync(path.join(scratchDir, 'package.json'), 'w'));
    expect.assertions(1);
    try {
      await createPackageJSON(scratchDir, 'project-name');
    } catch (e) {
      expect(e.toString()).toMatch('file already exists');
    }
  });
});

describe('createExampleFromTemplates', () => {
  describe('javascript', () => {
    const templatesDir = path.join(process.cwd(), 'templates', 'javascript');
    test('it creates functions and assets directories', async () => {
      await createExampleFromTemplates(scratchDir);

      const dirs = await readdir(scratchDir);
      const templateDirContents = await readdir(templatesDir);
      expect(dirs).toEqual(templateDirContents);
    });

    test('it copies the functions from the templates/javascript/functions directory', async () => {
      await createExampleFromTemplates(scratchDir);

      const functions = await readdir(path.join(scratchDir, 'functions'));
      const templateFunctions = await readdir(path.join(templatesDir, 'functions'));
      expect(functions).toEqual(templateFunctions);
    });

    test('it rejects if there is already a functions directory', async () => {
      await mkdir(path.join(scratchDir, 'functions'));
      expect.assertions(1);
      try {
        await createExampleFromTemplates(scratchDir);
      } catch (e) {
        expect(e.toString()).toMatch('file already exists');
      }
    });
  });
  describe('typescript', () => {
    const templatesDir = path.join(process.cwd(), 'templates', 'typescript');
    test('it creates functions and assets directories', async () => {
      await createExampleFromTemplates(scratchDir, 'typescript');

      const dirs = await readdir(scratchDir);
      const templateDirContents = await readdir(templatesDir);
      expect(dirs).toEqual(templateDirContents);
    });

    test('it copies the typescript files from the templates/typescript/src directory', async () => {
      await createExampleFromTemplates(scratchDir, 'typescript');

      const src = await readdir(path.join(scratchDir, 'src'));
      const templateSrc = await readdir(path.join(templatesDir, 'src'));
      expect(src).toEqual(templateSrc);
    });

    test('it rejects if there is already a src directory', async () => {
      await mkdir(path.join(scratchDir, 'src'));
      expect.assertions(1);
      try {
        await createExampleFromTemplates(scratchDir, 'typescript');
      } catch (e) {
        expect(e.toString()).toMatch('file already exists');
      }
    });
  });
});

describe('createEnvFile', () => {
  test('it creates a new .env file', async () => {
    await createEnvFile(scratchDir, {
      accountSid: 'AC123',
      authToken: 'qwerty123456',
    });
    const file = await stat(path.join(scratchDir, '.env'));
    expect(file.isFile());
    const contents = await readFile(path.join(scratchDir, '.env'), { encoding: 'utf-8' });
    expect(contents).toMatch('ACCOUNT_SID=AC123');
    expect(contents).toMatch('AUTH_TOKEN=qwerty123456');
  });

  test('it rejects if there is already an .env file', async () => {
    fs.closeSync(fs.openSync(path.join(scratchDir, '.env'), 'w'));
    expect.assertions(1);
    try {
      await createEnvFile(scratchDir, {
        accountSid: 'AC123',
        authToken: 'qwerty123456',
      });
    } catch (e) {
      expect(e.toString()).toMatch('file already exists');
    }
  });
});

describe('createNvmrcFile', () => {
  test('it creates a new .nvmrc file', async () => {
    await createNvmrcFile(scratchDir);
    const file = await stat(path.join(scratchDir, '.nvmrc'));
    expect(file.isFile());
    const contents = await readFile(path.join(scratchDir, '.nvmrc'), { encoding: 'utf-8' });
    expect(contents).toMatch(versions.node);
  });

  test('it rejects if there is already an .nvmrc file', async () => {
    fs.closeSync(fs.openSync(path.join(scratchDir, '.nvmrc'), 'w'));
    expect.assertions(1);
    try {
      await createNvmrcFile(scratchDir);
    } catch (e) {
      expect(e.toString()).toMatch('file already exists');
    }
  });
});

describe('createTsconfig', () => {
  test('it creates a new tsconfig.json file', async () => {
    await createTsconfigFile(scratchDir);
    const file = await stat(path.join(scratchDir, 'tsconfig.json'));
    expect(file.isFile());
    const contents = await readFile(path.join(scratchDir, 'tsconfig.json'), { encoding: 'utf-8' });
    expect(contents).toMatch('"compilerOptions"');
  });

  test('it rejects if there is already an tsconfig.json file', async () => {
    fs.closeSync(fs.openSync(path.join(scratchDir, 'tsconfig.json'), 'w'));
    expect.assertions(1);
    try {
      await createTsconfigFile(scratchDir);
    } catch (e) {
      expect(e.toString()).toMatch('file already exists');
    }
  });
});

describe('createEmptyFileStructure', () => {
  test('creates functions and assets directory for javascript', async () => {
    await createEmptyFileStructure(scratchDir, 'javascript');
    const functions = await stat(path.join(scratchDir, 'functions'));
    expect(functions.isDirectory());
    const assets = await stat(path.join(scratchDir, 'assets'));
    expect(assets.isDirectory());
  });

  test('creates src, functions and assets directory for typescript', async () => {
    await createEmptyFileStructure(scratchDir, 'typescript');
    const src = await stat(path.join(scratchDir, 'src'));
    expect(src.isDirectory());
    const functions = await stat(path.join(scratchDir, 'src', 'functions'));
    expect(functions.isDirectory());
    const assets = await stat(path.join(scratchDir, 'src', 'assets'));
    expect(assets.isDirectory());
  });
});
