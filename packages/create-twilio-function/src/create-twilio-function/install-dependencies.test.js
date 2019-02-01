const execa = require('execa');
const { installDependencies } = require('./install-dependencies');

jest.mock('execa');

describe('installDependencies', () => {
  test('it calls `npm install` in the target directory', async () => {
    execa.mockResolvedValue({ stdout: 'done' });

    await installDependencies('./scratch');

    expect(execa).toHaveBeenCalledWith('npm', ['install'], {
      cwd: './scratch',
      shell: process.env.SHELL
    });
  });
});
