import { stripIndent } from 'common-tags';
import { logger } from '../utils/logger';
import chalk = require('chalk');

type Options = {
  shouldPrintMessage: boolean;
  shouldThrowError: boolean;
  functionName?: string;
};

export function checkForValidAuthToken(
  authToken: string | undefined,
  options: Options = { shouldPrintMessage: false, shouldThrowError: false }
): boolean {
  if (authToken && authToken.length === 32) {
    return true;
  }

  let message = '';
  let title = '';
  if (!authToken) {
    title = 'Missing Auth Token';
    message = stripIndent`
      You are missing a Twilio Auth Token. You can add one into your .env file:

      ${chalk.bold('AUTH_TOKEN=')}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    `;
  } else {
    title = 'Invalid Auth Token';
    message = stripIndent`
      The value for your AUTH_TOKEN in your .env file is not a valid Twilio Auth Token.

      It should be 32 characters long and made of letters and numbers.
    `;
  }

  if (options.shouldPrintMessage && message) {
    logger.error(message, title);
  }

  if (options.shouldThrowError && message) {
    const err = new Error(title);
    err.name = 'INVALID_CONFIG';
    err.message = `${title}\n${message}`;
    let meta = '';
    if (options.functionName) {
      meta = `\n--- at ${options.functionName}`;
    }
    err.stack = `${err.message}${meta}`;
    throw err;
  }

  return false;
}
