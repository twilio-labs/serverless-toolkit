const pkgInstall = require('pkg-install');
const { installDependencies } = require('./install-dependencies');

jest.mock('pkg-install');

describe('installDependencies', () => {
  test('it calls `npm install` in the target directory', async () => {
    pkgInstall.projectInstall.mockResolvedValue({ stdout: 'done' });

    await installDependencies('./scratch');

    expect(pkgInstall.projectInstall).toHaveBeenCalledWith({
      cwd: './scratch'
    });
  });
});
