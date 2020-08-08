import { cleanUpStackTrace } from '../../../src/utils/stack-trace/clean-up';

jest.mock('../../../src/utils/stack-trace/helpers', () => {
  return {
    ...jest.requireActual('../../../src/utils/stack-trace/helpers'),
    formatStackTraceWithInternals: jest
      .fn()
      .mockReturnValue('[mock stacktrace]'),
  };
});

describe('cleanUpStackTrace', () => {
  beforeEach(() => {
    delete process.env.TWILIO_SERVERLESS_FULL_ERRORS;
  });

  afterAll(() => {
    delete process.env.TWILIO_SERVERLESS_FULL_ERRORS;
  });

  test('overrides stack trace by default', () => {
    const err = new Error('Hello');
    cleanUpStackTrace(err);
    expect(err.stack).toBe('[mock stacktrace]');
    expect(err.name).toBe('Error');
    expect(err.message).toBe('Hello');
  });

  test('leaves stack trace if env variable is set', () => {
    process.env.TWILIO_SERVERLESS_FULL_ERRORS = 'true';
    const err = new Error('Hello');
    cleanUpStackTrace(err);
    expect(err.stack).not.toBe('[mock stacktrace]');
    expect(err.name).toBe('Error');
    expect(err.message).toBe('Hello');
  });
});
