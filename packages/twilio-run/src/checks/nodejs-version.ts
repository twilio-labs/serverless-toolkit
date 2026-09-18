import { stripIndent } from 'common-tags';
import { logger } from '../utils/logger';
import { DEPRECATED_NODE_MAJORS } from './deprecated-runtime';

export function printVersionWarning(nodeVersion: string): void {
  const title = 'Deprecated Node.js Version Found';
  const msg = stripIndent`
      You are currently running Node.js ${nodeVersion} on this local machine. This version is deprecated and is no longer supported by the production environment for Twilio Serverless.

      When you deploy to Twilio Serverless, you may encounter differences between local development and production.

      For a more accurate local development experience, please switch your Node.js version.
      A tool like nvm (https://github.com/creationix/nvm) can help.
  `;

  logger.warn(msg, title);
}

export default function checkNodejsVersion() {
  const nodeVersion = process.versions.node;
  const major = Number.parseInt(nodeVersion.split('.')[0], 10);

  // A deny list of deprecated majors rather than an allow list of supported
  // ones, so that an older toolkit release never warns about a Node.js version
  // that became supported after it was published.
  if (DEPRECATED_NODE_MAJORS.includes(major)) {
    printVersionWarning(nodeVersion);
  }
}
