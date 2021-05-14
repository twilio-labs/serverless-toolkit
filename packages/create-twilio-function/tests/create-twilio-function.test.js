let mockDownloadFileShouldFail = false;

jest.mock('window-size', () => ({ get: () => ({ width: 80 }) }));
jest.mock('ora');
jest.mock('boxen', () => {
  return () => 'success message';
});
jest.mock('twilio-run/dist/templating/actions', () => {
  return {
    downloadTemplate: jest.fn().mockImplementation(() => {
      return mockDownloadFileShouldFail
        ? Promise.reject(new Error('Failed to download'))
        : Promise.resolve();
    }),
  };
});
jest.mock('../src/create-twilio-function/install-dependencies.js', () => {
  return { installDependencies: jest.fn() };
});
jest.mock('../src/create-twilio-function/import-credentials.js', () => {
  return jest.fn().mockReturnValue(Promise.resolve(false));
});
jest.mock('../src/create-twilio-function/prompt.js', () => {
  return {
    promptForAccountDetails: jest.fn().mockReturnValue(
      Promise.resolve({
        accountSid: 'test-sid',
        authToken: 'test-auth-token',
      })
    ),
    promptForProjectName: jest
      .fn()
      .mockReturnValue(Promise.resolve({ name: 'test-function-11' })),
  };
});

const fs = require('fs');
const path = require('path');
const os = require('os');
const { promisify } = require('util');

const ora = require('ora');
const nock = require('nock');
const rimraf = require('rimraf');

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const { downloadTemplate } = require('twilio-run/dist/templating/actions');
const {
  installDependencies,
} = require('../src/create-twilio-function/install-dependencies');
const createTwilioFunction = require('../src/create-twilio-function');

const spinner = {
  start: () => spinner,
  succeed: () => spinner,
  fail: () => spinner,
  clear: () => spinner,
  stop: () => spinner,
};
ora.mockImplementation(() => {
  return spinner;
});

function setupDir() {
  const dirPath = fs.mkdtempSync(
    path.join(os.tmpdir(), 'test-twilio-run-ctf-')
  );
  return {
    tmpDir: dirPath,
    cleanUp() {
      rimraf.sync(dirPath);
    },
  };
}

let backupConsole;
beforeAll(() => {
  backupConsole = console.log;
  console.log = jest.fn();
  nock.disableNetConnect();
});

afterAll(() => {
  console.log = backupConsole;
  nock.enableNetConnect();
});

describe('createTwilioFunction', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  describe('with an acceptable project name', () => {
    beforeEach(() => {
      nock('https://raw.githubusercontent.com')
        .get('/github/gitignore/master/Node.gitignore')
        .reply(200, '*.log\n.env');
    });

    describe('javascript', () => {
      it('scaffolds a Twilio Function', async () => {
        const { tmpDir: scratchDir, cleanUp } = setupDir();
        const name = 'test-function-1';
        await createTwilioFunction({
          name,
          path: scratchDir,
        });

        const dir = await stat(path.join(scratchDir, name));
        expect(dir.isDirectory());
        const env = await stat(path.join(scratchDir, name, '.env'));
        expect(env.isFile());
        const nvmrc = await stat(path.join(scratchDir, name, '.nvmrc'));
        expect(nvmrc.isFile());

        const packageJSON = await stat(
          path.join(scratchDir, name, 'package.json')
        );
        expect(packageJSON.isFile());

        const gitignore = await stat(path.join(scratchDir, name, '.gitignore'));
        expect(gitignore.isFile());

        const functions = await stat(path.join(scratchDir, name, 'functions'));
        expect(functions.isDirectory());

        const assets = await stat(path.join(scratchDir, name, 'assets'));
        expect(assets.isDirectory());

        const example = await stat(
          path.join(scratchDir, name, 'functions', 'hello-world.js')
        );
        expect(example.isFile());

        const asset = await stat(
          path.join(scratchDir, name, 'assets', 'index.html')
        );
        expect(asset.isFile());

        expect(installDependencies).toHaveBeenCalledWith(
          path.join(scratchDir, name)
        );

        expect(console.log).toHaveBeenCalledWith('success message');
        cleanUp();
      });

      it('scaffolds an empty Twilio Function', async () => {
        const { tmpDir: scratchDir, cleanUp } = setupDir();
        const name = 'test-function-2';
        await createTwilioFunction({
          name,
          path: scratchDir,
          empty: true,
        });

        const dir = await stat(path.join(scratchDir, name));
        expect(dir.isDirectory());
        const env = await stat(path.join(scratchDir, name, '.env'));
        expect(env.isFile());
        const nvmrc = await stat(path.join(scratchDir, name, '.nvmrc'));
        expect(nvmrc.isFile());
        const serverlessrc = await stat(
          path.join(scratchDir, name, '.twilioserverlessrc')
        );
        expect(serverlessrc.isFile());

        const packageJSON = await stat(
          path.join(scratchDir, name, 'package.json')
        );
        expect(packageJSON.isFile());

        const gitignore = await stat(path.join(scratchDir, name, '.gitignore'));
        expect(gitignore.isFile());

        const functions = await stat(path.join(scratchDir, name, 'functions'));
        expect(functions.isDirectory());

        const assets = await stat(path.join(scratchDir, name, 'assets'));
        expect(assets.isDirectory());

        const functionsDir = await readdir(
          path.join(scratchDir, name, 'functions')
        );
        expect(functionsDir.length).toEqual(0);

        const assetsDir = await readdir(path.join(scratchDir, name, 'assets'));
        expect(assetsDir.length).toEqual(0);

        expect(installDependencies).toHaveBeenCalledWith(
          path.join(scratchDir, name)
        );

        expect(console.log).toHaveBeenCalledWith('success message');
        cleanUp();
      });

      describe('templates', () => {
        it('scaffolds a Twilio Function with a template', async () => {
          const name = 'test-function-3';
          const { tmpDir: scratchDir, cleanUp } = setupDir();
          try {
            await createTwilioFunction({
              name,
              path: scratchDir,
              template: 'blank',
            });
          } catch (err) {
            expect(err).toBeUndefined();
          }

          const dir = await stat(path.join(scratchDir, name));
          expect(dir.isDirectory());
          const env = await stat(path.join(scratchDir, name, '.env'));
          expect(env.isFile());
          const nvmrc = await stat(path.join(scratchDir, name, '.nvmrc'));
          expect(nvmrc.isFile());

          const packageJSON = await stat(
            path.join(scratchDir, name, 'package.json')
          );
          expect(packageJSON.isFile());

          const gitignore = await stat(
            path.join(scratchDir, name, '.gitignore')
          );
          expect(gitignore.isFile());

          expect(downloadTemplate).toHaveBeenCalledWith(
            'blank',
            '',
            path.join(scratchDir, name)
          );
          expect(installDependencies).toHaveBeenCalledWith(
            path.join(scratchDir, name)
          );

          expect(console.log).toHaveBeenCalledWith('success message');
          cleanUp();
        });

        it('handles a missing template gracefully', async () => {
          const { tmpDir: scratchDir, cleanUp } = setupDir();
          const templateName = 'missing';
          const name = 'test-function-4';

          mockDownloadFileShouldFail = true;

          const fail = jest.spyOn(spinner, 'fail');

          await createTwilioFunction({
            name,
            path: scratchDir,
            template: templateName,
          });

          expect.assertions(3);

          expect(fail).toHaveBeenCalledTimes(1);
          expect(fail).toHaveBeenCalledWith(
            `The template "${templateName}" doesn't exist`
          );
          try {
            await stat(path.join(scratchDir, name));
          } catch (e) {
            expect(e.toString()).toMatch('no such file or directory');
          }
          cleanUp();
          mockDownloadFileShouldFail = false;
        });
      });
    });

    describe('typescript', () => {
      it('scaffolds a Twilio Function', async () => {
        const { tmpDir: scratchDir, cleanUp } = setupDir();
        const name = 'test-function-5';
        await createTwilioFunction({
          name,
          path: scratchDir,
          typescript: true,
        });

        const dir = await stat(path.join(scratchDir, name));
        expect(dir.isDirectory());
        const env = await stat(path.join(scratchDir, name, '.env'));
        expect(env.isFile());
        const nvmrc = await stat(path.join(scratchDir, name, '.nvmrc'));
        expect(nvmrc.isFile());
        const tsconfig = await stat(
          path.join(scratchDir, name, 'tsconfig.json')
        );
        expect(tsconfig.isFile());

        const packageJSON = await stat(
          path.join(scratchDir, name, 'package.json')
        );
        expect(packageJSON.isFile());

        const gitignore = await stat(path.join(scratchDir, name, '.gitignore'));
        expect(gitignore.isFile());

        const src = await stat(path.join(scratchDir, name, 'src'));
        expect(src.isDirectory());

        const functions = await stat(
          path.join(scratchDir, name, 'src', 'functions')
        );
        expect(functions.isDirectory());

        const assets = await stat(path.join(scratchDir, name, 'src', 'assets'));
        expect(assets.isDirectory());

        const example = await stat(
          path.join(scratchDir, name, 'src', 'functions', 'hello-world.ts')
        );
        expect(example.isFile());

        const asset = await stat(
          path.join(scratchDir, name, 'src', 'assets', 'index.html')
        );
        expect(asset.isFile());

        expect(installDependencies).toHaveBeenCalledWith(
          path.join(scratchDir, name)
        );

        expect(console.log).toHaveBeenCalledWith('success message');
        cleanUp();
      });

      it('scaffolds an empty Twilio Function', async () => {
        const { tmpDir: scratchDir, cleanUp } = setupDir();
        const name = 'test-function-6';
        await createTwilioFunction({
          name,
          path: scratchDir,
          empty: true,
          typescript: true,
        });

        const dir = await stat(path.join(scratchDir, name));
        expect(dir.isDirectory());
        const env = await stat(path.join(scratchDir, name, '.env'));
        expect(env.isFile());
        const nvmrc = await stat(path.join(scratchDir, name, '.nvmrc'));
        expect(nvmrc.isFile());
        const tsconfig = await stat(
          path.join(scratchDir, name, 'tsconfig.json')
        );
        expect(tsconfig.isFile());

        const packageJSON = await stat(
          path.join(scratchDir, name, 'package.json')
        );
        expect(packageJSON.isFile());

        const gitignore = await stat(path.join(scratchDir, name, '.gitignore'));
        expect(gitignore.isFile());

        const src = await stat(path.join(scratchDir, name, 'src'));
        expect(src.isDirectory());

        const functions = await stat(
          path.join(scratchDir, name, 'src', 'functions')
        );
        expect(functions.isDirectory());

        const assets = await stat(path.join(scratchDir, name, 'src', 'assets'));
        expect(assets.isDirectory());

        const functionsDir = await readdir(
          path.join(scratchDir, name, 'src', 'functions')
        );
        expect(functionsDir.length).toEqual(0);

        const assetsDir = await readdir(
          path.join(scratchDir, name, 'src', 'assets')
        );
        expect(assetsDir.length).toEqual(0);

        expect(installDependencies).toHaveBeenCalledWith(
          path.join(scratchDir, name)
        );

        expect(console.log).toHaveBeenCalledWith('success message');
        cleanUp();
      });

      describe('templates', () => {
        it("doesn't scaffold", async () => {
          const { tmpDir: scratchDir, cleanUp } = setupDir();
          const fail = jest.spyOn(spinner, 'fail');
          const name = 'test-function-7';
          await createTwilioFunction({
            name,
            path: scratchDir,
            typescript: true,
            template: 'blank',
          });

          expect.assertions(4);

          expect(fail).toHaveBeenCalledTimes(1);
          expect(fail).toHaveBeenCalledWith(
            'There are no TypeScript templates available. You can generate an example project or an empty one with the --empty flag.'
          );
          expect(console.log).not.toHaveBeenCalled();

          try {
            await stat(path.join(scratchDir, name, 'package.json'));
          } catch (e) {
            expect(e.toString()).toMatch('no such file or directory');
          }
          cleanUp();
        });
      });
    });

    it("doesn't scaffold if the target folder name already exists", async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const name = 'test-function-8';
      fs.mkdirSync(path.join(scratchDir, name), { recursive: true });
      const fail = jest.spyOn(spinner, 'fail');

      await createTwilioFunction({
        name,
        path: scratchDir,
      });

      expect.assertions(4);

      expect(fail).toHaveBeenCalledTimes(1);
      expect(fail).toHaveBeenCalledWith(
        `A directory called '${name}' already exists. Please create your function in a new directory.`
      );
      expect(console.log).not.toHaveBeenCalled();

      try {
        await stat(path.join(scratchDir, name, 'package.json'));
      } catch (e) {
        expect(e.toString()).toMatch('no such file or directory');
      }

      cleanUp();
    });

    it("fails gracefully if it doesn't have permission to create directories", async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      // chmod with 0o555 does not work on Windows.
      if (process.platform === 'win32') {
        return;
      }

      const name = 'test-function-9';
      const chmod = promisify(fs.chmod);
      await chmod(scratchDir, 0o555);
      const fail = jest.spyOn(spinner, 'fail');

      await createTwilioFunction({
        name,
        path: scratchDir,
      });

      expect.assertions(4);

      expect(fail).toHaveBeenCalledTimes(1);
      expect(fail).toHaveBeenCalledWith(
        `You do not have permission to create files or directories in the path '${scratchDir}'.`
      );
      expect(console.log).not.toHaveBeenCalled();

      try {
        await stat(path.join(scratchDir, name, 'package.json'));
      } catch (e) {
        expect(e.toString()).toMatch('no such file or directory');
      }
      cleanUp();
    });

    it("doesn't scaffold if empty is true and a template is defined", async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const fail = jest.spyOn(spinner, 'fail');
      const name = 'test-function-10';
      await createTwilioFunction({
        name,
        path: scratchDir,
        empty: true,
        template: 'blank',
      });

      expect.assertions(4);

      expect(fail).toHaveBeenCalledTimes(1);
      expect(fail).toHaveBeenCalledWith(
        'You cannot scaffold an empty Functions project with a template. Please choose empty or a template.'
      );
      expect(console.log).not.toHaveBeenCalled();

      try {
        await stat(path.join(scratchDir, name, 'package.json'));
      } catch (e) {
        expect(e.toString()).toMatch('no such file or directory');
      }
      cleanUp();
    });
  });

  describe('with an unacceptable project name', () => {
    beforeEach(() => {
      nock('https://raw.githubusercontent.com')
        .get('/github/gitignore/master/Node.gitignore')
        .reply(200, '*.log\n.env');
    });

    it('scaffolds a Twilio Function and prompts for a new name', async () => {
      const { tmpDir: scratchDir, cleanUp } = setupDir();
      const badName = 'GreatTest!!!';
      const name = 'test-function-11';
      await createTwilioFunction({
        name: badName,
        path: scratchDir,
      });

      const dir = await stat(path.join(scratchDir, name));
      expect(dir.isDirectory());
      const env = await stat(path.join(scratchDir, name, '.env'));
      expect(env.isFile());
      const nvmrc = await stat(path.join(scratchDir, name, '.nvmrc'));
      expect(nvmrc.isFile());

      const packageJSON = await stat(
        path.join(scratchDir, name, 'package.json')
      );
      expect(packageJSON.isFile());

      const gitignore = await stat(path.join(scratchDir, name, '.gitignore'));
      expect(gitignore.isFile());

      const functions = await stat(path.join(scratchDir, name, 'functions'));
      expect(functions.isDirectory());

      const assets = await stat(path.join(scratchDir, name, 'assets'));
      expect(assets.isDirectory());

      const example = await stat(
        path.join(scratchDir, name, 'functions', 'hello-world.js')
      );
      expect(example.isFile());

      const asset = await stat(
        path.join(scratchDir, name, 'assets', 'index.html')
      );
      expect(asset.isFile());

      expect(installDependencies).toHaveBeenCalledWith(
        path.join(scratchDir, name)
      );

      expect(console.log).toHaveBeenCalledWith('success message');
      cleanUp();
    });
  });
});
