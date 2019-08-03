import {
  ExternalCliOptions,
  SharedFlagsWithCrdentials,
} from '../../commands/shared';
import { getDebugFunction } from '../../utils/logger';
import { readLocalEnvFile } from './env';

const debug = getDebugFunction('twilio-run:config:credentials');

export type Credentials = {
  accountSid: string;
  authToken: string;
};

/**
 * Determines the credentials by the following order of preference:
 * 1. value via explicit flags
 * 2. value passed in through externalCliOptions if `profile` exists
 * 3. value passed in through externalCliOptions if `project` (deprecated and removed in `@twilio/cli-core` v3) exists
 * 4. value in .env file
 * 5. value passed in through externalCliOptions
 * 6. empty string
 * @param flags Flags passed into command
 * @param externalCliOptions Any external information for example passed by the Twilio CLI
 */
export async function getCredentialsFromFlags<
  T extends SharedFlagsWithCrdentials
>(flags: T, externalCliOptions?: ExternalCliOptions): Promise<Credentials> {
  // default Twilio CLI credentials (4) or empty string (5)
  let accountSid =
    (externalCliOptions &&
      !(externalCliOptions.profile || externalCliOptions.project) &&
      externalCliOptions.username) ||
    '';
  let authToken =
    (externalCliOptions &&
      !(externalCliOptions.profile || externalCliOptions.project) &&
      externalCliOptions.password) ||
    '';

  if (flags.cwd) {
    // env file content (3)
    const { localEnv } = await readLocalEnvFile(flags);
    if (localEnv.ACCOUNT_SID) {
      debug('Override value with .env ACCOUNT_SID value');
      accountSid = localEnv.ACCOUNT_SID;
    }
    if (localEnv.AUTH_TOKEN) {
      debug('Override value with .env AUTH_TOKEN value');
      authToken = localEnv.AUTH_TOKEN;
    }
  }

  // specific profile specified. override both credentials (2)
  if (
    externalCliOptions &&
    (externalCliOptions.profile || externalCliOptions.project)
  ) {
    debug('Values read from explicit CLI profile');
    accountSid = externalCliOptions.username;
    authToken = externalCliOptions.password;
  }

  // specific flag passed. override for that flag (1)
  if (flags.accountSid) {
    debug('Override accountSid with value from flag');
    accountSid = flags.accountSid;
  }
  if (flags.authToken) {
    debug('Override authToken with value from flag');
    authToken = flags.authToken;
  }

  return {
    accountSid,
    authToken,
  };
}
