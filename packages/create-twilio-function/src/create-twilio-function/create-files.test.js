const { createPackageJSON, createDirectory } = require('./create-files');
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
