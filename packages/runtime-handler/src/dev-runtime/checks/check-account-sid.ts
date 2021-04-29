import { stripIndent } from 'common-tags';
import { LoggerInstance } from '../types';
import chalk = require('chalk');

type Options = {
  shouldPrintMessage: boolean;
  shouldThrowError: boolean;
  functionName?: string;
  logger?: LoggerInstance;
};

export function checkForValidAccountSid(
  accountSid: string | undefined,
  options: Options = {
    shouldPrintMessage: false,
    shouldThrowError: false,
  }
): accountSid is string {
  if (accountSid && accountSid.length === 34 && accountSid.startsWith('AC')) {
    return true;
  }

  let message = '';
  let title = '';
  if (!accountSid) {
    title = 'Missing Account SID';
    message = stripIndent`
      You are missing a Twilio Account SID. You can add one into your .env file:

      ${chalk.bold('ACCOUNT_SID=')}ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    `;
  } else {
    title = 'Invalid Account SID';
    message = stripIndent`
      The value for your ACCOUNT_SID in your .env file is not a valid Twilio Account SID.

      It should look like this: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    `;
  }

  if (options.shouldPrintMessage && message) {
    options.logger?.error(message, title);
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
