import {
  ClientConfig,
  AccountSidConfig,
  UsernameConfig,
} from '../types/client';

export const DEFAULT_TEST_CLIENT_CONFIG: AccountSidConfig = {
  accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  authToken: '<SECRET>',
};

export const DEFAULT_TEST_CLIENT_CONFIG_USERNAME_PASSWORD: UsernameConfig = {
  username: 'ACyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
  password: '<PASSWORD>',
};
