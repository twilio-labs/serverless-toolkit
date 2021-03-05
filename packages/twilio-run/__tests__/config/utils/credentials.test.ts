import { getCredentialsFromFlags } from '../../../src/config/utils/credentials';

const baseFlags = {
  config: '.twilio-function',
  cwd: process.cwd(),
  logLevel: 'info' as 'info',
  loadSystemEnv: false,
};

describe('getCredentialsFromFlags', () => {
  test('should return empty if nothing is passed', async () => {
    const credentials = await getCredentialsFromFlags(baseFlags, {}, undefined);
    expect(credentials).toEqual({
      username: '',
      password: '',
    });
  });

  test('should return flag values if passed', async () => {
    const credentials = await getCredentialsFromFlags(
      { ...baseFlags, accountSid: 'ACxxxxx', authToken: 'some-token' },
      {},
      undefined
    );
    expect(credentials).toEqual({
      username: 'ACxxxxx',
      password: 'some-token',
    });
  });

  test('should read from env file', async () => {
    const credentials = await getCredentialsFromFlags(
      { ...baseFlags },
      {
        ACCOUNT_SID: 'ACyyyyyyyyy',
        AUTH_TOKEN: 'example-token',
      },
      undefined
    );
    expect(credentials).toEqual({
      username: 'ACyyyyyyyyy',
      password: 'example-token',
    });
  });

  test('should take external default options if nothing is passed', async () => {
    const credentials = await getCredentialsFromFlags(
      { ...baseFlags },
      {},
      { username: 'ACzzzzzzz', password: 'api-secret', profile: undefined }
    );
    expect(credentials).toEqual({
      username: 'ACzzzzzzz',
      password: 'api-secret',
    });
  });

  test('env variables should not override external default options', async () => {
    const credentials = await getCredentialsFromFlags(
      { ...baseFlags },
      {
        ACCOUNT_SID: 'ACyyyyyyyyy',
        AUTH_TOKEN: 'example-token',
      },
      { username: 'ACzzzzzzz', password: 'api-secret', profile: undefined }
    );
    expect(credentials).toEqual({
      username: 'ACzzzzzzz',
      password: 'api-secret',
    });
  });

  test('external options with profile should override env variables', async () => {
    const credentials = await getCredentialsFromFlags(
      { ...baseFlags },
      {
        ACCOUNT_SID: 'ACyyyyyyyyy',
        AUTH_TOKEN: 'example-token',
      },
      { username: 'ACzzzzzzz', password: 'api-secret', profile: 'demo' }
    );
    expect(credentials).toEqual({
      username: 'ACzzzzzzz',
      password: 'api-secret',
    });
  });

  test('external options with project should override env variables', async () => {
    // project flag is deprecated and removed in v3 @twilio/cli-core but
    // included here just to make sure

    const credentials = await getCredentialsFromFlags(
      {
        ...baseFlags,
      },
      {
        ACCOUNT_SID: 'ACyyyyyyyyy',
        AUTH_TOKEN: 'example-token',
      },
      {
        username: 'ACzzzzzzz',
        password: 'api-secret',
        project: 'demo',
      }
    );
    expect(credentials).toEqual({
      username: 'ACzzzzzzz',
      password: 'api-secret',
    });
  });

  test('should prefer external CLI if profile is passed', async () => {
    const credentials = await getCredentialsFromFlags(
      { ...baseFlags },
      {
        ACCOUNT_SID: 'ACyyyyyyyyy',
        AUTH_TOKEN: 'example-token',
      },
      { username: 'ACzzzzzzz', password: 'api-secret', profile: 'demo' }
    );
    expect(credentials).toEqual({
      username: 'ACzzzzzzz',
      password: 'api-secret',
    });
  });

  test('should prefer external CLI if project is passed', async () => {
    // project flag is deprecated and removed in v3 @twilio/cli-core but
    // included here just to make sure
    const credentials = await getCredentialsFromFlags(
      { ...baseFlags },
      {
        ACCOUNT_SID: 'ACyyyyyyyyy',
        AUTH_TOKEN: 'example-token',
      },
      { username: 'ACzzzzzzz', password: 'api-secret', project: 'demo' }
    );
    expect(credentials).toEqual({
      username: 'ACzzzzzzz',
      password: 'api-secret',
    });
  });

  test('should prefer flag over everything', async () => {
    const credentials = await getCredentialsFromFlags(
      { ...baseFlags, accountSid: 'ACxxxxx', authToken: 'some-token' },
      {
        ACCOUNT_SID: 'ACyyyyyyyyy',
        AUTH_TOKEN: 'example-token',
      },
      {
        username: 'ACzzzzzzz',
        password: 'api-secret',
        profile: 'demo',
        project: 'demo',
      }
    );
    expect(credentials).toEqual({
      username: 'ACxxxxx',
      password: 'some-token',
    });
  });
});
