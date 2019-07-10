import boxen from 'boxen';
import chalk from 'chalk';
import { stripIndent } from 'common-tags';
import size from 'window-size';
import wrapAnsi from 'wrap-ansi';

const SERVERLESS_NODE_JS_VERSION = '8.10';

export function printVersionWarning(
  nodeVersion: string,
  expectedVersion: string
): void {
  const msg = chalk`
      {underline.bold {yellow WARNING!} {bold Different Node.js version}}

      You are currently running Node.js ${nodeVersion} on this local machine. The production environment for Twilio Serverless is currently on ${expectedVersion}.

      When you deploy to Twilio Serverless, you may encounter differences between local development and production.

      For a more accurate local development experience, please switch your Node.js version.
      A tool like nvm (https://github.com/creationix/nvm) can help.
      `;
  const wrappedMsg = wrapAnsi(msg, size.width - 20);
  console.error(
    boxen(stripIndent(wrappedMsg), {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      float: 'center',
    })
  );
}

export default function() {
  const nodeVersion = process.versions.node;
  if (!nodeVersion.startsWith(SERVERLESS_NODE_JS_VERSION)) {
    printVersionWarning(nodeVersion, SERVERLESS_NODE_JS_VERSION);
  }
}
