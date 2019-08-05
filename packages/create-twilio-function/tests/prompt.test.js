const {
  promptForAccountDetails
} = require('../src/create-twilio-function/prompt');
const inquirer = require('inquirer');

describe('promptForAccountDetails', () => {
  test(`should ask for an accountSid if not specified`, async () => {
    inquirer.prompt = jest.fn(() =>
      Promise.resolve({
        accountSid: 'AC1234',
        authToken: 'test-auth-token'
      })
    );
    await promptForAccountDetails({
      name: 'function-test'
    });
    expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    expect(inquirer.prompt).toHaveBeenCalledWith(expect.any(Array));
  });

  test(`should ask for an auth if not specified`, async () => {
    inquirer.prompt = jest.fn(() =>
      Promise.resolve({
        authToken: 'test-auth-token'
      })
    );
    await promptForAccountDetails({
      name: 'function-test',
      accountSid: 'AC1234'
    });
    expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    expect(inquirer.prompt).toHaveBeenCalledWith(expect.any(Array));
  });

  test(`should not prompt if account sid and auth token specified`, async () => {
    inquirer.prompt = jest.fn(() =>
      Promise.resolve({
        accountSid: 'AC1234',
        authToken: 'test-auth-token'
      })
    );
    await promptForAccountDetails({
      name: 'function-test',
      accountSid: 'AC5678',
      authToken: 'other-test-token'
    });
    expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    expect(inquirer.prompt).toHaveBeenCalledWith([]);
  });

  test(`should not ask for credentials if skip-credentials flag is true`, async () => {
    inquirer.prompt = jest.fn(() => {});
    await promptForAccountDetails({
      skipCredentials: true
    });
    expect(inquirer.prompt).not.toHaveBeenCalled();
  });
});
