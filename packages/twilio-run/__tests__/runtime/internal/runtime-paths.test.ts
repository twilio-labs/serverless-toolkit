jest.doMock('@twilio-labs/serverless-api', () => {
  const mod = jest.requireActual('@twilio-labs/serverless-api');
  mod.fsHelpers.getListOfFunctionsAndAssets = jest
    .fn()
    .mockImplementation(() => {
      return Promise.resolve({
        assets: [
          {
            name: '/example.html',
            path: '/example.html',
            access: 'public',
            content: '',
          },
          {
            name: '/secret.html',
            path: '/secret.html',
            access: 'private',
            content: '',
          },
        ],
        functions: [
          {
            name: '/sms/reply.js',
            path: '/sms/reply.js',
            access: 'public',
            content: '',
          },
          {
            name: '/token.js',
            path: '/token.js',
            access: 'protected',
            content: '',
          },
        ],
      });
    });
  mod.fsHelpers.getPathAndAccessFromFileInfo = jest
    .fn()
    .mockImplementation(mod.fsHelpers.getPathAndAccessFromFileInfo);
  return mod;
});

import { fsHelpers } from '@twilio-labs/serverless-api';
import { getFunctionsAndAssets } from '../../../src/runtime/internal/runtime-paths';

test('calls the right functions', async () => {
  const result = await getFunctionsAndAssets('/var/task/handlers');
  expect(fsHelpers.getListOfFunctionsAndAssets).toHaveBeenCalled();
});

test('returns the right functions and assets', async () => {
  const { functions, assets } = await getFunctionsAndAssets(
    '/var/task/handlers'
  );
  expect(functions).toEqual([
    {
      name: '/sms/reply.js',
      path: '/sms/reply.js',
      access: 'public',
      content: '',
    },
    {
      name: '/token.js',
      path: '/token.js',
      access: 'protected',
      content: '',
    },
  ]);
  expect(assets).toEqual([
    {
      name: '/example.html',
      path: '/example.html',
      access: 'public',
      content: '',
    },
    {
      name: '/secret.html',
      path: '/secret.html',
      access: 'private',
      content: '',
    },
  ]);
});
