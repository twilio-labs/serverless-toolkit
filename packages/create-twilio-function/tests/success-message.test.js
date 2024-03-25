jest.mock('pkg-install');
jest.mock('window-size', () => ({ get: () => ({ width: 80 }) }));

const pkgInstall = require('pkg-install');
const chalk = require('chalk');

const successMessage = require('../src/create-twilio-function/success-message');

describe('successMessage', () => {
  test('creates a success message based on the package manager', async () => {
    pkgInstall.getPackageManager.mockResolvedValue('yarn');
    const config = {
      name: 'test-function',
      path: './test-path',
    };
    const message = await successMessage(config);
    expect(message).toEqual(expect.stringContaining('yarn start'));
    expect(message).toEqual(
      expect.stringContaining(
        chalk`Created {bold ${config.name}} at {bold ${config.path}}`
      )
    );
  });
});
