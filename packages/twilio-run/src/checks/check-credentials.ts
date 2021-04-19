import { stripIndent } from 'common-tags';
import { logger } from '../utils/logger';

type ConfigWithCredentials = {
  username?: string;
  password?: string;
};

export function checkConfigForCredentials(
  config: ConfigWithCredentials,
  shouldExit = true
) {
  if (config.username && config.password) {
    return;
  }

  const msg = stripIndent`
      We couldn't find any Twilio credentials for you.

      Please enter ACCOUNT_SID and AUTH_TOKEN in your .env file.

      Alternatively you can specify them via the command-line using "--username" and "--password"

      For more information use "--help"
    `;

  logger.error(msg, 'Missing Credentials');

  if (shouldExit) {
    process.exit(1);
  }
}
