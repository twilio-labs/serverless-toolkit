import { formatStackTraceWithInternals } from './helpers';

/**
 * Uses the V8 Stack Trace API to hide any twilio-run internals from stack traces
 * https://v8.dev/docs/stack-trace-api
 *
 * @param err Instance that inherits from Error
 */
export function cleanUpStackTrace<T extends Error>(err: T): T {
  if (typeof process.env.TWILIO_SERVERLESS_FULL_ERRORS !== 'undefined') {
    return err;
  }

  const backupPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = formatStackTraceWithInternals;
  err.stack = err.stack;
  Error.prepareStackTrace = backupPrepareStackTrace;
  return err;
}
