import { createRedactedObject, generalRedactor } from '../../src/utils/debug';

describe('generalRedactor', () => {
  test('redacts the correct properties', () => {
    const context = {
      ACCOUNT_SID: 'ACxxxxxxx',
      AUTH_TOKEN: 'auth-token',
      SOME_URL: 'https://twilio.com/labs',
    };

    const redacted = generalRedactor(context);
    expect(redacted.ACCOUNT_SID).toBe('ACxxxxxxx');
    expect(redacted.AUTH_TOKEN).toBe('[REDACTED]');
    expect(redacted.SOME_URL).toBe('https://twilio.com/labs');
  });
});

describe('createRedactedObject', () => {
  test('does not modify the original object', () => {
    const context = {
      ACCOUNT_SID: 'ACxxxxxxx',
      AUTH_TOKEN: 'auth-token',
      SOME_URL: 'https://twilio.com/labs',
      env: {
        ACCOUNT_SID: 'ACyyyyyyy',
        AUTH_TOKEN: 'another-auth-token',
      },
    };

    const redacted = createRedactedObject(context, generalRedactor);

    expect(redacted).toEqual({
      ACCOUNT_SID: 'ACxxxxxxx',
      AUTH_TOKEN: '[REDACTED]',
      SOME_URL: 'https://twilio.com/labs',
      env: {
        ACCOUNT_SID: '[REDACTED]',
        AUTH_TOKEN: '[REDACTED]',
      },
    });
    expect(context).toEqual({
      ACCOUNT_SID: 'ACxxxxxxx',
      AUTH_TOKEN: 'auth-token',
      SOME_URL: 'https://twilio.com/labs',
      env: {
        ACCOUNT_SID: 'ACyyyyyyy',
        AUTH_TOKEN: 'another-auth-token',
      },
    });
  });
});
