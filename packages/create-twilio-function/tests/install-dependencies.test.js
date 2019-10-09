const pkgInstall = require('pkg-install');
const {
  installDependencies
} = require('../src/create-twilio-function/install-dependencies');
const path = require('path');

const scratchDir = path.join(process.cwd(), 'scratch');

jest.mock('pkg-install');

describe('installDependencies', () => {
  test('it calls `npm install` in the target directory', async () => {
    pkgInstall.projectInstall.mockResolvedValue({ stdout: 'done' });

    await installDependencies(scratchDir);

    expect(pkgInstall.projectInstall).toHaveBeenCalledWith({
      cwd: scratchDir
    });
  });
});
