import { stripIndent } from 'common-tags';
import { logger } from '../utils/logger';

const SERVERLESS_NODE_JS_VERSION = '10.';

export function printVersionWarning(
  nodeVersion: string,
  expectedVersion: string
): void {
  const title = 'Different Node.js Version Found';
  const msg = stripIndent`
      You are currently running Node.js ${nodeVersion} on this local machine. The production environment for Twilio Serverless currently supports versions ${expectedVersion}x.

      When you deploy to Twilio Serverless, you may encounter differences between local development and production.

      For a more accurate local development experience, please switch your Node.js version.
      A tool like nvm (https://github.com/creationix/nvm) can help.
  `;

  logger.warn(msg, title);
}

export default function checkNodejsVersion() {
  const nodeVersion = process.versions.node;
  if (!nodeVersion.startsWith(SERVERLESS_NODE_JS_VERSION)) {
    printVersionWarning(nodeVersion, SERVERLESS_NODE_JS_VERSION);
  }
}
