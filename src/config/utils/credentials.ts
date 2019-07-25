import debug from 'debug';
import {
  ExternalCliOptions,
  SharedFlagsWithCrdentials,
} from '../../commands/shared';
import { readLocalEnvFile } from './env';

const log = debug('twilio-run:config:credentials');

export type Credentials = {
  accountSid: string;
  authToken: string;
};

/**
 * Determines the credentials by the following order of preference:
 * 1. value via explicit flags
 * 2. value passed in through externalCliOptions if `project` exists
 * 3. value in .env file
 * 4. value passed in through externalCliOptions
 * 5. empty string
 * @param flags Flags passed into command
 * @param externalCliOptions Any external information for example passed by the Twilio CLI
 */
export async function getCredentialsFromFlags<
  T extends SharedFlagsWithCrdentials
>(flags: T, externalCliOptions?: ExternalCliOptions): Promise<Credentials> {
  // default Twilio CLI credentials (4) or empty string (5)
  let accountSid =
    (externalCliOptions &&
      !externalCliOptions.project &&
      externalCliOptions.username) ||
    '';
  let authToken =
    (externalCliOptions &&
      !externalCliOptions.project &&
      externalCliOptions.password) ||
    '';

  if (flags.cwd) {
    // env file content (3)
    const { localEnv } = await readLocalEnvFile(flags);
    if (localEnv.ACCOUNT_SID) {
      log('Override value with .env ACCOUNT_SID value');
      accountSid = localEnv.ACCOUNT_SID;
    }
    if (localEnv.AUTH_TOKEN) {
      log('Override value with .env AUTH_TOKEN value');
      authToken = localEnv.AUTH_TOKEN;
    }
  }

  // specific project specified. override both credentials (2)
  if (externalCliOptions && externalCliOptions.project) {
    log('Values read from explicit CLI project');
    accountSid = externalCliOptions.username;
    authToken = externalCliOptions.password;
  }

  // specific flag passed. override for that flag (1)
  if (flags.accountSid) {
    log('Override accountSid with value from flag');
    accountSid = flags.accountSid;
  }
  if (flags.authToken) {
    log('Override authToken with value from flag');
    authToken = flags.authToken;
  }

  return {
    accountSid,
    authToken,
  };
}
