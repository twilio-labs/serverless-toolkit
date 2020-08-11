const fs = require('fs');
const path = require('path');
const os = require('os');
const { promisify } = require('util');

const rimraf = require('rimraf');
const nock = require('nock');

const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

const createGitignore = require('../src/create-twilio-function/create-gitignore');

const scratchDir = path.join(os.tmpdir(), 'scratch');

describe('create-gitignore', () => {
  beforeAll(() => {
    rimraf.sync(scratchDir);
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    fs.mkdirSync(scratchDir);
    nock('https://raw.githubusercontent.com')
      .get('/github/gitignore/master/Node.gitignore')
      .reply(200, '*.log\n.env');
  });

  afterEach(() => {
    rimraf.sync(scratchDir);
    nock.cleanAll();
  });

  describe('createGitignore', () => {
    test('it creates a new .gitignore file', async () => {
      await createGitignore(scratchDir);
      const file = await stat(path.join(scratchDir, '.gitignore'));
      expect(file.isFile());
      const contents = await readFile(path.join(scratchDir, '.gitignore'), {
        encoding: 'utf-8',
      });
      expect(contents).toMatch('*.log');
      expect(contents).toMatch('.env');
    });

    test('it rejects if there is already a .gitignore file', async () => {
      fs.closeSync(fs.openSync(path.join(scratchDir, '.gitignore'), 'w'));
      expect.assertions(1);
      try {
        await createGitignore(scratchDir);
      } catch (e) {
        expect(e.toString()).toMatch('file already exists');
      }
    });
  });
});
