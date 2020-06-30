/** @module @twilio-labs/serverless-api */

type BaseClientConfig = {
  /**
   * Twilio Region
   */
  region?: string;
  /**
   * Twilio Edge
   */
  edge?: string;
  /**
   * Limit concurrency
   */
  concurrency?: number;
  /**
   * Number of retry attempts the client will make on a failure
   */
  retryLimit?: number;
};

export type AccountSidConfig = BaseClientConfig & {
  /**
   * Twilio AccountSID or API Key
   */
  accountSid: string;
  /**
   * Twilio Auth Token or API Secret
   */
  authToken: string;
};

export type UsernameConfig = BaseClientConfig & {
  /**
   * Twilio AccountSID or API Key
   */
  username: string;
  /**
   * Twilio Auth Token or API Secret
   */
  password: string;
};

/**
 * Config to set up a API request client
 */
export type ClientConfig = AccountSidConfig | UsernameConfig;
