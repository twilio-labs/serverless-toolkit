const {
  createPackageJSON,
  createDirectory,
  createExampleFunction,
  createEnvFile
} = require('./create-files');
const mockFs = require('mock-fs');
const fs = require('fs');

beforeEach(async () => {
  mockFs({
    '/test': {}
  });
});

afterEach(async () => {
  mockFs.restore();
});

describe('createDirectory', () => {
  test('it creates a new directory with the project name', async () => {
    await createDirectory('/test', 'test-project');
    const dir = fs.statSync('/test/test-project');
    expect(dir.isDirectory());
  });

  test("it doesn't create a directory if it exists", async () => {
    fs.mkdirSync('/test/test-project');
    await createDirectory('/test', 'test-project');
    const dir = fs.statSync('/test/test-project');
    expect(dir.isDirectory());
  });
});

describe('createPackageJSON', () => {
  test('it creates a new package.json file with the name of the project', async () => {
    await createPackageJSON('/test', 'project-name');
    const file = fs.statSync('/test/package.json');
    expect(file.isFile());
    const packageJSON = JSON.parse(fs.readFileSync('/test/package.json'));
    expect(packageJSON.name).toEqual('project-name');
  });

  test('it rejects if there is already a package.json', async () => {
    fs.closeSync(fs.openSync('/test/package.json', 'w'));
    expect.assertions(1);
    try {
      await createPackageJSON('/test', 'project-name');
    } catch (e) {
      expect(e.toString()).toMatch('file already exists');
    }
  });
});

describe('createExampleFunction', () => {
  test('it creates a new example function', async () => {
    await createExampleFunction('/test');
    const file = fs.statSync('/test/example.js');
    expect(file.isFile());
    const contents = fs.readFileSync('/test/example.js', { encoding: 'utf-8' });
    expect(contents).toMatch('Twilio.twiml.VoiceResponse');
  });

  test('it rejects if there is already a package.json', async () => {
    fs.closeSync(fs.openSync('/test/example.js', 'w'));
    expect.assertions(1);
    try {
      await createExampleFunction('/test');
    } catch (e) {
      expect(e.toString()).toMatch('file already exists');
    }
  });
});

describe('createEnvFile', () => {
  test('it creates a new .env file', async () => {
    await createEnvFile('/test', {
      accountSid: 'AC123',
      authToken: 'qwerty123456'
    });
    const file = fs.statSync('/test/.env');
    expect(file.isFile());
    const contents = fs.readFileSync('/test/.env', { encoding: 'utf-8' });
    expect(contents).toMatch('ACCOUNT_SID=AC123');
    expect(contents).toMatch('AUTH_TOKEN=qwerty123456');
  });

  test('it rejects if there is already a package.json', async () => {
    fs.closeSync(fs.openSync('/test/.env', 'w'));
    expect.assertions(1);
    try {
      await createEnvFile('/test', {
        accountSid: 'AC123',
        authToken: 'qwerty123456'
      });
    } catch (e) {
      expect(e.toString()).toMatch('file already exists');
    }
  });
});
