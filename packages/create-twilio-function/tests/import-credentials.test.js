const importCredentials = require('../src/create-twilio-function/import-credentials');
const inquirer = require('inquirer');

describe('importCredentials', () => {
  describe('if credentials are present in the env', () => {
    afterEach(() => {
      delete process.env.TWILIO_ACCOUNT_SID;
      delete process.env.TWILIO_AUTH_TOKEN;
    });

    test('it should prompt to ask if to use credentials and return them if affirmative', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC1234';
      process.env.TWILIO_AUTH_TOKEN = 'auth-token';

      inquirer.prompt = jest.fn(() =>
        Promise.resolve({
          importCredentials: true
        })
      );

      const credentials = await importCredentials({});
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
      expect(inquirer.prompt).toHaveBeenCalledWith(expect.any(Array));
      expect(credentials.accountSid).toBe('AC1234');
      expect(credentials.authToken).toBe('auth-token');
    });

    test('it should prompt to ask if to use credentials and return an empty object if negative', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC1234';
      process.env.TWILIO_AUTH_TOKEN = 'auth-token';

      inquirer.prompt = jest.fn(() =>
        Promise.resolve({
          importCredentials: false
        })
      );

      const credentials = await importCredentials({});
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
      expect(inquirer.prompt).toHaveBeenCalledWith(expect.any(Array));
      expect(credentials.accountSid).toBe(undefined);
      expect(credentials.authToken).toBe(undefined);
    });

    test('it should return credentials if the option importCredentials is true', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC1234';
      process.env.TWILIO_AUTH_TOKEN = 'auth-token';

      const credentials = await importCredentials({ importCredentials: true });
      expect(inquirer.prompt).not.toHaveBeenCalled();
      expect(credentials.accountSid).toBe('AC1234');
      expect(credentials.authToken).toBe('auth-token');
    });

    test('it should not return credentials if skipCredentials is true', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC1234';
      process.env.TWILIO_AUTH_TOKEN = 'auth-token';

      const credentials = await importCredentials({
        skipCredentials: true,
        importCredentials: true
      });
      expect(inquirer.prompt).not.toHaveBeenCalled();
      expect(credentials.accountSid).toBe(undefined);
      expect(credentials.authToken).toBe(undefined);
    });
  });

  describe('if there are no credentials in the env', () => {
    test('it should not ask about importing credentials', async () => {
      delete process.env.TWILIO_ACCOUNT_SID;
      delete process.env.TWILIO_AUTH_TOKEN;
      await importCredentials({});
      expect(inquirer.prompt).not.toHaveBeenCalled();
    });
  });
});
