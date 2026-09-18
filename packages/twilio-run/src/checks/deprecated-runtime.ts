import { stripIndent } from 'common-tags';
import { logger } from '../utils/logger';

/**
 * Node.js major versions that are no longer accepted by Twilio Serverless.
 *
 * This is deliberately a deny list rather than an allow list of supported
 * versions: a project pinned to an older version of the toolkit must not warn
 * about a runtime that became valid after it was published. A deprecation is a
 * settled fact, so an outdated deny list stays correct — at worst it misses a
 * newer deprecation, in which case the platform still rejects the build.
 */
export const DEPRECATED_NODE_MAJORS = [4, 6, 8, 10, 12, 14, 16, 18, 20];

export const DEPRECATED_RUNTIMES = DEPRECATED_NODE_MAJORS.map(
  (major) => `node${major}`
);

/**
 * Warns if a project is configured to deploy to a runtime that Twilio
 * Serverless no longer accepts for new builds, pointing at the field to
 * change. Twilio Serverless remains the authority on which runtimes it
 * accepts, so this only surfaces the problem earlier and never blocks a
 * deploy. Unknown or future runtime values are left alone.
 */
export function checkForDeprecatedRuntime(runtime?: string): boolean {
  if (typeof runtime !== 'string' || !DEPRECATED_RUNTIMES.includes(runtime)) {
    return true;
  }

  const title = 'Deprecated Node.js Runtime Configured';
  const msg = stripIndent`
    Your project is configured to deploy to "${runtime}", which is deprecated and is no longer accepted for new builds.

    Please update the "runtime" field in your .twilioserverlessrc (or pass the --runtime flag) to a version that is still supported.
  `;

  logger.warn(msg, title);

  return false;
}
