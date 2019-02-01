const { promptForAccountDetails } = require('./prompt');
const inquirer = require('inquirer');

describe('promptForAccountDetails', () => {
  beforeEach(() => jest.clearAllMocks());

  test(`should ask for an accountSid if not specified`, async () => {
    inquirer.prompt = jest.fn(() =>
      Promise.resolve({
        accountSid: 'test-sid',
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
        accountSid: 'test-sid',
        authToken: 'test-auth-token'
      })
    );
    await promptForAccountDetails({
      name: 'function-test',
      accountSid: 'test-sid'
    });
    expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    expect(inquirer.prompt).toHaveBeenCalledWith(expect.any(Array));
  });

  test(`should not prompt if account sid and auth token specified`, async () => {
    inquirer.prompt = jest.fn(() =>
      Promise.resolve({
        accountSid: 'test-sid',
        authToken: 'test-auth-token'
      })
    );
    await promptForAccountDetails({
      name: 'function-test',
      accountSid: 'test-sid',
      authToken: 'test-auth-token'
    });
    expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    expect(inquirer.prompt).toHaveBeenCalledWith([]);
  });
});
