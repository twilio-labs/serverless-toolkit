const path = require('path');
jest.mock('pkg-install');

const pkgInstall = require('pkg-install');

const {
  installDependencies,
} = require('../src/create-twilio-function/install-dependencies');

const scratchDir = path.join(process.cwd(), 'scratch');

describe('installDependencies', () => {
  test('it calls `npm install` in the target directory', async () => {
    pkgInstall.projectInstall.mockResolvedValue({ stdout: 'done' });

    await installDependencies(scratchDir);

    expect(pkgInstall.projectInstall).toHaveBeenCalledWith({ cwd: scratchDir });
  });
});
