const {
  createPackageJSON,
  createDirectory,
  createExampleFunction,
  createEnvFile,
  createGitignore
} = require('./create-files');
const fs = require('fs');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);

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
    const dir = fs.statSync('./scratch/test-project');
    expect(dir.isDirectory());
  });

  test("it doesn't create a directory if it exists", async () => {
    fs.mkdirSync('./scratch/test-project');
    await createDirectory('./scratch', 'test-project');
    const dir = fs.statSync('./scratch/test-project');
    expect(dir.isDirectory());
  });
});

describe('createPackageJSON', () => {
  test('it creates a new package.json file with the name of the project', async () => {
    await createPackageJSON('./scratch', 'project-name');
    const file = fs.statSync('./scratch/package.json');
    expect(file.isFile());
    const packageJSON = JSON.parse(fs.readFileSync('./scratch/package.json'));
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
    const file = fs.statSync('./scratch/example.js');
    expect(file.isFile());
    const contents = fs.readFileSync('./scratch/example.js', {
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
    const file = fs.statSync('./scratch/.env');
    expect(file.isFile());
    const contents = fs.readFileSync('./scratch/.env', { encoding: 'utf-8' });
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

describe('createGitignore', () => {
  test('it creates a new .gitignore file', async () => {
    await createGitignore('./scratch');
    const file = fs.statSync('./scratch/.gitignore');
    expect(file.isFile());
    const contents = await readFile('./scratch/.gitignore', {
      encoding: 'utf-8'
    });
    expect(contents).toMatch('*.log');
  });

  test('it rejects if there is already a .gitignore file', async () => {
    fs.closeSync(fs.openSync('./scratch/.gitignore', 'w'));
    expect.assertions(1);
    try {
      await createGitignore('./scratch');
    } catch (e) {
      expect(e.toString()).toMatch('file already exists');
    }
  });
});
