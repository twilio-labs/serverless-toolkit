const createTwilioFunction = require('../src/create-twilio-function');
const {
  installDependencies
} = require('../src/create-twilio-function/install-dependencies');
const inquirer = require('inquirer');
const ora = require('ora');
const boxen = require('boxen');
const fs = require('fs');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);

jest.mock('inquirer');
jest.mock('ora');
jest.mock('boxen', () => {
  return () => 'success message';
});
ora.mockImplementation(() => {
  const spinner = {
    start: () => spinner,
    succeed: () => spinner
  };
  return spinner;
});
jest.mock('../src/create-twilio-function/install-dependencies.js', () => {
  return { installDependencies: jest.fn() };
});
console.log = jest.fn();

beforeAll(async () => {
  await rimraf('./scratch');
});

beforeEach(async () => {
  await mkdir('./scratch');
});

afterEach(async () => {
  await rimraf('./scratch');
});

describe('createTwilioFunction', () => {
  beforeEach(() => jest.clearAllMocks());

  test('it scaffolds a Twilio Function', async () => {
    inquirer.prompt = jest.fn(() =>
      Promise.resolve({
        accountSid: 'test-sid',
        authToken: 'test-auth-token'
      })
    );

    const name = 'test-function';
    await createTwilioFunction({ name, path: './scratch' });

    const dir = await stat(`./scratch/${name}`);
    expect(dir.isDirectory());
    const env = await stat(`./scratch/${name}/.env`);
    expect(env.isFile());
    const nvmrc = await stat(`./scratch/${name}/.nvmrc`);
    expect(nvmrc.isFile());

    const packageJSON = await stat(`./scratch/${name}/package.json`);
    expect(packageJSON.isFile());

    const gitignore = await stat(`./scratch/${name}/.gitignore`);
    expect(gitignore.isFile());

    const functions = await stat(`./scratch/${name}/functions`);
    expect(functions.isDirectory());

    const assets = await stat(`./scratch/${name}/assets`);
    expect(assets.isDirectory());

    const example = await stat(`./scratch/${name}/functions/example.js`);
    expect(example.isFile());

    expect(installDependencies).toHaveBeenCalledWith(`./scratch/${name}`);

    expect(console.log).toHaveBeenCalledWith('success message');
  });

  it("doesn't scaffold if the target folder name already exists", async () => {
    const name = 'test-function';
    await mkdir('./scratch/test-function');
    console.error = jest.fn();

    await createTwilioFunction({ name, path: './scratch' });

    expect.assertions(4);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      `A directory called '${name}' already exists. Please create your function in a new directory.`
    );
    expect(console.log).not.toHaveBeenCalled();

    try {
      await stat(`./scratch/${name}/package.json`);
    } catch (e) {
      expect(e.toString()).toMatch('no such file or directory');
    }
  });

  it("fails gracefully if it doesn't have permission to create directories", async () => {
    const name = 'test-function';
    const chmod = promisify(fs.chmod);
    await chmod('./scratch', 0o555);
    console.error = jest.fn();

    await createTwilioFunction({ name, path: './scratch' });

    expect.assertions(4);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      `You do not have permission to create files or directories in the path './scratch'.`
    );
    expect(console.log).not.toHaveBeenCalled();

    try {
      await stat(`./scratch/${name}/package.json`);
    } catch (e) {
      expect(e.toString()).toMatch('no such file or directory');
    }
  });
});
