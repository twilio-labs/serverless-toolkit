jest.mock('../../../src/config/utils/env');

import { getCredentialsFromFlags } from '../../../src/config/utils/credentials';

const baseFlags = { config: '.twilio-function', cwd: process.cwd() };
const baseExternalCliOptions = {};

describe('getCredentialsFromFlags', () => {
  test('should return empty if nothing is passed', async () => {
    require('../../../src/config/utils/env').__setVariables({}, '');

    const credentials = await getCredentialsFromFlags(baseFlags, undefined);
    expect(credentials).toEqual({
      accountSid: '',
      authToken: '',
    });
  });

  test('should return flag values if passed', async () => {
    require('../../../src/config/utils/env').__setVariables({}, '');

    const credentials = await getCredentialsFromFlags(
      { ...baseFlags, accountSid: 'ACxxxxx', authToken: 'some-token' },
      undefined
    );
    expect(credentials).toEqual({
      accountSid: 'ACxxxxx',
      authToken: 'some-token',
    });
  });

  test('should read from env file', async () => {
    require('../../../src/config/utils/env').__setVariables(
      {
        ACCOUNT_SID: 'ACyyyyyyyyy',
        AUTH_TOKEN: 'example-token',
      },
      ''
    );

    const credentials = await getCredentialsFromFlags(
      { ...baseFlags },
      undefined
    );
    expect(credentials).toEqual({
      accountSid: 'ACyyyyyyyyy',
      authToken: 'example-token',
    });
  });

  test('should take external default options if nothing is passed', async () => {
    require('../../../src/config/utils/env').__setVariables({}, '');

    const credentials = await getCredentialsFromFlags(
      { ...baseFlags },
      { username: 'ACzzzzzzz', password: 'api-secret', project: undefined }
    );
    expect(credentials).toEqual({
      accountSid: 'ACzzzzzzz',
      authToken: 'api-secret',
    });
  });

  test('env variables should override external default options', async () => {
    require('../../../src/config/utils/env').__setVariables(
      {
        ACCOUNT_SID: 'ACyyyyyyyyy',
        AUTH_TOKEN: 'example-token',
      },
      ''
    );

    const credentials = await getCredentialsFromFlags(
      { ...baseFlags },
      { username: 'ACzzzzzzz', password: 'api-secret', project: undefined }
    );
    expect(credentials).toEqual({
      accountSid: 'ACyyyyyyyyy',
      authToken: 'example-token',
    });
  });

  test('external options with project should override env variables', async () => {
    require('../../../src/config/utils/env').__setVariables(
      {
        ACCOUNT_SID: 'ACyyyyyyyyy',
        AUTH_TOKEN: 'example-token',
      },
      ''
    );

    const credentials = await getCredentialsFromFlags(
      { ...baseFlags },
      { username: 'ACzzzzzzz', password: 'api-secret', project: 'demo' }
    );
    expect(credentials).toEqual({
      accountSid: 'ACzzzzzzz',
      authToken: 'api-secret',
    });
  });

  test('should prefer external CLI if project is passed', async () => {
    require('../../../src/config/utils/env').__setVariables(
      {
        ACCOUNT_SID: 'ACyyyyyyyyy',
        AUTH_TOKEN: 'example-token',
      },
      ''
    );

    const credentials = await getCredentialsFromFlags(
      { ...baseFlags },
      { username: 'ACzzzzzzz', password: 'api-secret', project: 'demo' }
    );
    expect(credentials).toEqual({
      accountSid: 'ACzzzzzzz',
      authToken: 'api-secret',
    });
  });

  test('should prefer flag over everything', async () => {
    require('../../../src/config/utils/env').__setVariables(
      {
        ACCOUNT_SID: 'ACyyyyyyyyy',
        AUTH_TOKEN: 'example-token',
      },
      ''
    );

    const credentials = await getCredentialsFromFlags(
      { ...baseFlags, accountSid: 'ACxxxxx', authToken: 'some-token' },
      { username: 'ACzzzzzzz', password: 'api-secret', project: 'demo' }
    );
    expect(credentials).toEqual({
      accountSid: 'ACxxxxx',
      authToken: 'some-token',
    });
  });
});
