const createTwilioFunction = require('../src/create-twilio-function');
const {
  installDependencies
} = require('../src/create-twilio-function/install-dependencies');
const inquirer = require('inquirer');
const ora = require('ora');
const nock = require('nock');
const fs = require('fs');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

jest.mock('window-size', () => ({ get: () => ({ width: 80 }) }));
jest.mock('inquirer');
jest.mock('ora');
jest.mock('boxen', () => {
  return () => 'success message';
});
const spinner = {
  start: () => spinner,
  succeed: () => spinner,
  fail: () => spinner,
  clear: () => spinner,
  stop: () => spinner
};
ora.mockImplementation(() => {
  return spinner;
});
jest.mock('../src/create-twilio-function/install-dependencies.js', () => {
  return { installDependencies: jest.fn() };
});
console.log = jest.fn();

beforeAll(async () => {
  await rimraf('./scratch');
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

beforeEach(async () => {
  await mkdir('./scratch');
});

afterEach(async () => {
  await rimraf('./scratch');
  nock.cleanAll();
});

describe('createTwilioFunction', () => {
  beforeEach(() => {
    inquirer.prompt = jest.fn(() =>
      Promise.resolve({
        accountSid: 'test-sid',
        authToken: 'test-auth-token'
      })
    );

    nock('https://raw.githubusercontent.com')
      .get('/github/gitignore/master/Node.gitignore')
      .reply(200, '*.log\n.env');
  });

  it('scaffolds a Twilio Function', async () => {
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

    const example = await stat(`./scratch/${name}/functions/hello-world.js`);
    expect(example.isFile());

    const asset = await stat(`./scratch/${name}/assets/index.html`);
    expect(asset.isFile());

    expect(installDependencies).toHaveBeenCalledWith(`scratch/${name}`);

    expect(console.log).toHaveBeenCalledWith('success message');
  });

  it('scaffolds a Twilio Function with a template', async () => {
    const gitHubAPI = nock('https://api.github.com');
    gitHubAPI
      .get('/repos/twilio-labs/function-templates/contents/blank')
      .reply(200, [
        {
          name: 'functions'
        },
        {
          name: '.env',
          download_url:
            'https://raw.githubusercontent.com/twilio-labs/function-templates/master/blank/.env'
        }
      ]);
    gitHubAPI
      .get('/repos/twilio-labs/function-templates/contents/blank/functions')
      .reply(200, [
        {
          name: 'blank.js',
          download_url:
            'https://raw.githubusercontent.com/twilio-labs/function-templates/master/blank/functions/blank.js'
        }
      ]);
    const gitHubRaw = nock('https://raw.githubusercontent.com');
    gitHubRaw
      .get('/twilio-labs/function-templates/master/blank/functions/blank.js')
      .reply(
        200,
        `exports.handler = function(context, event, callback) {
  callback(null, {});
};`
      );
    gitHubRaw
      .get('/github/gitignore/master/Node.gitignore')
      .reply(200, 'node_modules/');
    gitHubRaw
      .get('/twilio-labs/function-templates/master/blank/.env')
      .reply(200, '');

    const name = 'test-function';
    await createTwilioFunction({
      name,
      path: './scratch',
      template: 'blank'
    });

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

    const exampleFiles = await readdir(`./scratch/${name}/functions`);
    expect(exampleFiles).toEqual(
      expect.not.arrayContaining(['hello-world.js'])
    );

    const templateFunction = await stat(`./scratch/${name}/functions/blank.js`);
    expect(templateFunction.isFile());

    const exampleAssets = await readdir(`./scratch/${name}/assets`);
    expect(exampleAssets).toEqual(expect.not.arrayContaining(['index.html']));

    expect(installDependencies).toHaveBeenCalledWith(`scratch/${name}`);

    expect(console.log).toHaveBeenCalledWith('success message');
  });

  it('handles a missing template gracefully', async () => {
    const templateName = 'missing';
    const name = 'test-function';
    const gitHubAPI = nock('https://api.github.com');
    gitHubAPI
      .get(`/repos/twilio-labs/function-templates/contents/${templateName}`)
      .reply(404);

    const fail = jest.spyOn(spinner, 'fail');

    await createTwilioFunction({
      name,
      path: './scratch',
      template: templateName
    });

    expect.assertions(3);

    expect(fail).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledWith(
      `The template "${templateName}" doesn't exist`
    );
    try {
      await stat(`./scratch/${name}`);
    } catch (e) {
      expect(e.toString()).toMatch('no such file or directory');
    }
  });

  it("doesn't scaffold if the target folder name already exists", async () => {
    const name = 'test-function';
    await mkdir('./scratch/test-function');
    const fail = jest.spyOn(spinner, 'fail');

    await createTwilioFunction({ name, path: './scratch' });

    expect.assertions(4);

    expect(fail).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledWith(
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
    const fail = jest.spyOn(spinner, 'fail');

    await createTwilioFunction({ name, path: './scratch' });

    expect.assertions(4);

    expect(fail).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledWith(
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
