export let _packageJson = {
  name: '<packageJsonName>',
};

export let _localEnv = {
  ACCOUNT_SID: 'ACxxxxxx',
  AUTH_TOKEN: 'some_auth_token',
};

export let _envPath = '/some/path/to/env';

export let _serviceName = 'test_service_name';

export let _credentials = {
  username: 'ACyyyyyyyy',
  password: 'test_auth_token',
};

export const getServiceNameFromFlags = jest.fn(() => {
  return Promise.resolve(_serviceName);
});

export const getCredentialsFromFlags = jest.fn(() => {
  return Promise.resolve(_credentials);
});

export const readPackageJsonContent = jest.fn(() => {
  return Promise.resolve(_packageJson);
});

export const readLocalEnvFile = jest.fn(() => {
  return Promise.resolve({ localEnv: _localEnv, envPath: _envPath });
});
