const pkgInstall = require('pkg-install');
const chalk = require('chalk');
const successMessage = require('../src/create-twilio-function/success-message');

jest.mock('pkg-install');

describe('successMessage', () => {
  test('creates a success message based on the package manager', async () => {
    pkgInstall.getPackageManager.mockResolvedValue('yarn');
    const config = {
      name: 'test-function',
      path: './test-path'
    };
    const message = await successMessage(config);
    expect(message).toEqual(expect.stringContaining('yarn start'));
    expect(message).toEqual(
      expect.stringContaining(
        chalk`Created {bold ${config.name}} at ${config.path}`
      )
    );
  });
});
