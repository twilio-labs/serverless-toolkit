const {
  createPackageJSON,
  createDirectory,
  createExampleFunction,
  createEnvFile
} = require('../src/create-twilio-function/create-files');
const fs = require('fs');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

beforeAll(async () => {
  await rimraf('./scratch');
});

beforeEach(async () => {
  await mkdir('./scratch');
});

afterEach(async () => {
  await rimraf('./scratch');
});

describe('createDirectory', () => {
  test('it creates a new directory with the project name', async () => {
    await createDirectory('./scratch', 'test-project');
    const dir = await stat('./scratch/test-project');
    expect(dir.isDirectory());
  });

  test('it throws an error if the directory exists', async () => {
    await mkdir('./scratch/test-project');
    expect.assertions(1);
    try {
      await createDirectory('./scratch', 'test-project');
    } catch (e) {
      expect(e.toString()).toMatch('EEXIST');
    }
  });
});

describe('createPackageJSON', () => {
  test('it creates a new package.json file with the name of the project', async () => {
    await createPackageJSON('./scratch', 'project-name');
    const file = await stat('./scratch/package.json');
    expect(file.isFile());
    const packageJSON = JSON.parse(await readFile('./scratch/package.json'));
    expect(packageJSON.name).toEqual('project-name');
  });

  test('it rejects if there is already a package.json', async () => {
    fs.closeSync(fs.openSync('./scratch/package.json', 'w'));
    expect.assertions(1);
    try {
      await createPackageJSON('./scratch', 'project-name');
    } catch (e) {
      expect(e.toString()).toMatch('file already exists');
    }
  });
});

describe('createExampleFunction', () => {
  test('it creates a new example function', async () => {
    await createExampleFunction('./scratch');
    const file = await stat('./scratch/example.js');
    expect(file.isFile());
    const contents = await readFile('./scratch/example.js', {
      encoding: 'utf-8'
    });
    expect(contents).toMatch('Twilio.twiml.VoiceResponse');
  });

  test('it rejects if there is already a package.json', async () => {
    fs.closeSync(fs.openSync('./scratch/example.js', 'w'));
    expect.assertions(1);
    try {
      await createExampleFunction('./scratch');
    } catch (e) {
      expect(e.toString()).toMatch('file already exists');
    }
  });
});

describe('createEnvFile', () => {
  test('it creates a new .env file', async () => {
    await createEnvFile('./scratch', {
      accountSid: 'AC123',
      authToken: 'qwerty123456'
    });
    const file = await stat('./scratch/.env');
    expect(file.isFile());
    const contents = await readFile('./scratch/.env', { encoding: 'utf-8' });
    expect(contents).toMatch('ACCOUNT_SID=AC123');
    expect(contents).toMatch('AUTH_TOKEN=qwerty123456');
  });

  test('it rejects if there is already an .env file', async () => {
    fs.closeSync(fs.openSync('./scratch/.env', 'w'));
    expect.assertions(1);
    try {
      await createEnvFile('./scratch', {
        accountSid: 'AC123',
        authToken: 'qwerty123456'
      });
    } catch (e) {
      expect(e.toString()).toMatch('file already exists');
    }
  });
});
