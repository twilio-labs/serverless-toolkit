jest.doMock('@twilio-labs/serverless-api', () => {
  const mod = jest.requireActual('@twilio-labs/serverless-api');
  mod.fsHelpers.getListOfFunctionsAndAssets = jest
    .fn()
    .mockImplementation(() => {
      return Promise.resolve({
        assets: [
          {
            name: 'example.html',
            path: '/var/task/handlers/example.html',
          },
          {
            name: 'secret.private.html',
            path: '/var/task/handlers/secret.private.html',
          },
        ],
        functions: [
          {
            name: 'sms/reply.js',
            path: '/var/task/handlers/sms/reply.js',
          },
          {
            name: 'token.protected.js',
            path: '/var/task/handlers/token.protected.js',
          },
        ],
      });
    });
  mod.fsHelpers.getPathAndAccessFromFileInfo = jest
    .fn()
    .mockImplementation(mod.fsHelpers.getPathAndAccessFromFileInfo);
  return mod;
});

const { getFunctionsAndAssets } = require('./runtime-paths');

const { fsHelpers } = require('@twilio-labs/serverless-api');

test('calls the right functions', async () => {
  const result = await getFunctionsAndAssets('/var/task/handlers');
  expect(fsHelpers.getListOfFunctionsAndAssets).toHaveBeenCalled();
  expect(fsHelpers.getPathAndAccessFromFileInfo).toHaveBeenCalled();
});

test('returns the right functions and assets', async () => {
  const { functions, assets } = await getFunctionsAndAssets(
    '/var/task/handlers'
  );
  expect(functions).toEqual([
    {
      functionPath: '/sms/reply',
      access: 'public',
      name: 'sms/reply.js',
      path: '/var/task/handlers/sms/reply.js',
    },
    {
      functionPath: '/token',
      access: 'protected',
      name: 'token.protected.js',
      path: '/var/task/handlers/token.protected.js',
    },
  ]);
});
