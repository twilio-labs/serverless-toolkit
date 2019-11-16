import { EnvironmentVariables } from '@twilio-labs/serverless-api';

export type EnvironmentVariablesWithAuth = EnvironmentVariables & {
  ACCOUNT_SID?: string;
  AUTH_TOKEN?: string;
  TWILIO_SERVERLESS_GITHUB_TOKEN?: string;
};
