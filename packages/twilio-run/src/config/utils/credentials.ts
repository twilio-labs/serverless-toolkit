import { ExternalCliOptions } from '../../commands/shared';
import { SharedFlagsWithCredentials } from '../../flags';
import { EnvironmentVariablesWithAuth } from '../../types/generic';
import { getDebugFunction } from '../../utils/logger';

const debug = getDebugFunction('twilio-run:config:credentials');

export type Credentials = {
  username: string;
  password: string;
};

/**
 * Determines the credentials by the following order of preference:
 * 1. value via explicit flags
 * If the command is twilio-run deploy
 *   2. value in .env file
 *   3. empty string
 * Else if the plugin is run from the Twilio CLI then
 *   2. value passed in through externalCliOptions if `profile` exists
 *   3. value passed in through externalCliOptions if `project` (deprecated and removed in `@twilio/cli-core` v3) exists
 *   4. value passed in through externalCliOptions
 *   5. empty string
 * @param flags Flags passed into command
 * @param envVariables Environment variables from (.env or system environment)
 * @param externalCliOptions Any external information for example passed by the Twilio CLI
 */
export async function getCredentialsFromFlags<
  T extends SharedFlagsWithCredentials
>(
  flags: T,
  envVariables: EnvironmentVariablesWithAuth,
  externalCliOptions?: ExternalCliOptions
): Promise<Credentials> {
  // default Twilio CLI credentials (4) or empty string (5)
  let username = '';
  let password = '';

  if (externalCliOptions) {
    debug('Using account credentials from Twilio CLI');
    username = externalCliOptions.username;
    password = externalCliOptions.password;
  } else {
    if (envVariables.ACCOUNT_SID) {
      debug('Using Account SID from env variables');
      username = envVariables.ACCOUNT_SID;
    }
    if (envVariables.AUTH_TOKEN) {
      debug('Using Auth Token from env variables');
      password = envVariables.AUTH_TOKEN;
    }
  }

  // specific flag passed. override for that flag (1)
  if (flags.accountSid) {
    debug('Override accountSid with value from flag');
    username = flags.accountSid;
  }
  if (flags.authToken) {
    debug('Override authToken with value from flag');
    password = flags.authToken;
  }

  return {
    username,
    password,
  };
}
