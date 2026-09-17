import { stripIndent } from 'common-tags';
import { logger } from '../utils/logger';

export const SUPPORTED_RUNTIMES = ['node22', 'node24'];

/**
 * Warns if the runtime a project is configured to deploy to is no longer
 * supported by Twilio Serverless. Deprecated runtimes are rejected for new
 * builds, so this surfaces the problem before the deploy fails.
 */
export function checkForDeprecatedRuntime(runtime?: string): boolean {
  if (typeof runtime !== 'string' || SUPPORTED_RUNTIMES.includes(runtime)) {
    return true;
  }

  const title = 'Unsupported Node.js Runtime Configured';
  const msg = stripIndent`
    Your project is configured to deploy to "${runtime}", which is not supported by Twilio Serverless and will be rejected for new builds.

    Supported runtimes are ${SUPPORTED_RUNTIMES.join(' and ')}.

    Please update the "runtime" field in your .twilioserverlessrc (or pass --runtime=${
      SUPPORTED_RUNTIMES[SUPPORTED_RUNTIMES.length - 1]
    }) to deploy successfully.
  `;

  logger.warn(msg, title);

  return false;
}
