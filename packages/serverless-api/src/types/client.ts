/**
 * Config to set up a API request client
 */
export type ClientConfig = {
  /**
   * Twilio AccountSID or API Key
   */
  accountSid: string;
  /**
   * Twilio Auth Token or API Secret
   */
  authToken: string;
};
