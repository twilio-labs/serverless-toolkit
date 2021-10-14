jest.unmock('twilio');

import { Express } from 'express';
import { readdirSync, readFileSync } from 'fs';
import { basename, resolve } from 'path';
import request from 'supertest';
import { LocalDevelopmentServer } from '../../src/dev-runtime/server';
import {
  ServerConfig,
  ServerlessResourceConfigWithFilePath,
} from '../../src/dev-runtime/types';

const TEST_DIR = resolve(__dirname, '../../fixtures');

const TEST_FUNCTIONS_DIR = resolve(TEST_DIR, 'functions');
const TEST_ASSETS_DIR = resolve(TEST_DIR, 'assets');
const TEST_ENV = {};

const availableFunctions: ServerlessResourceConfigWithFilePath[] = readdirSync(
  TEST_FUNCTIONS_DIR
).map((name: string) => {
  const filePath = resolve(TEST_FUNCTIONS_DIR, name);
  const content = readFileSync(filePath, 'utf8');
  const url = `/${basename(name, '.js')}`;
  return { name, path: url, filePath, access: 'public', content };
});
const availableAssets: ServerlessResourceConfigWithFilePath[] = readdirSync(
  TEST_ASSETS_DIR
).map((name: string) => {
  const filePath = resolve(TEST_ASSETS_DIR, name);
  const url = `/${name}`;
  const content = readFileSync(filePath);
  return { name, filePath, path: url, access: 'public', content };
});

const BASE_CONFIG: ServerConfig = {
  baseDir: TEST_DIR,
  env: TEST_ENV,
  port: 9000,
  url: 'http://localhost:9000',
  detailedLogs: false,
  live: true,
  logs: false,
  legacyMode: false,
  appName: 'integration-test',
  forkProcess: false,
  logger: undefined,
  routes: { assets: [], functions: [] },
  enableDebugLogs: false,
};

type InternalResponse = request.Response & {
  statusCode: number;
  headers: {
    [key: string]: string | undefined;
  };
};

function responseToSnapshotJson(response: InternalResponse) {
  let { statusCode, type, body, text, headers } = response;
  delete headers['date'];
  delete headers['last-modified'];

  if (text && text.startsWith('Error')) {
    // stack traces are different in every environment
    // let's not snapshot values that rely on it
    text = `${text.split('\n')[0]} ...`;
  }
  delete headers['content-length'];
  delete headers['etag'];

  return {
    statusCode,
    type,
    body,
    text,
    headers,
  };
}

describe('with an express app', () => {
  let app: Express;

  describe('with inline function handling', () => {
    beforeAll(async () => {
      app = new LocalDevelopmentServer(9000, {
        ...BASE_CONFIG,
        routes: {
          assets: availableAssets,
          functions: availableFunctions,
        },
        forkProcess: false,
      } as ServerConfig).getApp();
    });

    describe('Function integration tests', () => {
      for (const testFnCode of availableFunctions) {
        test(`${testFnCode.name} should match snapshot`, async () => {
          const response = await request(app).get(testFnCode.path);
          if (response.status === 500) {
            expect(response.text).toMatch(/Error/);
          } else {
            const result = responseToSnapshotJson(response as InternalResponse);
            expect(result).toMatchSnapshot();
          }
        });
      }
    });

    describe('Assets integration tests', () => {
      for (const testAsset of availableAssets) {
        test(`${testAsset.name} should match snapshot`, async () => {
          const response = await request(app).get(testAsset.path);
          const result = responseToSnapshotJson(response as InternalResponse);
          expect(result).toMatchSnapshot();
        });

        test(`OPTIONS request to ${testAsset.name} should return CORS headers and no body`, async () => {
          const response = (await request(app).options(
            testAsset.path
          )) as InternalResponse;
          expect(response.headers['access-control-allow-origin']).toEqual('*');
          expect(response.headers['access-control-allow-headers']).toEqual(
            'Accept, Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, User-Agent'
          );
          expect(response.headers['access-control-allow-methods']).toEqual(
            'GET, POST, OPTIONS'
          );
          expect(response.headers['access-control-expose-headers']).toEqual(
            'ETag'
          );
          expect(response.headers['access-control-max-age']).toEqual('86400');
          expect(response.headers['access-control-allow-credentials']).toEqual(
            'true'
          );
          expect(response.text).toEqual('');
        });

        test(`GET request to ${testAsset.name} should not return CORS headers`, async () => {
          const response = (await request(app).get(
            testAsset.path
          )) as InternalResponse;
          expect(
            response.headers['access-control-allow-origin']
          ).toBeUndefined();
          expect(
            response.headers['access-control-allow-headers']
          ).toBeUndefined();
          expect(
            response.headers['access-control-allow-methods']
          ).toBeUndefined();
          expect(
            response.headers['access-control-expose-headers']
          ).toBeUndefined();
          expect(response.headers['access-control-max-age']).toBeUndefined();
          expect(
            response.headers['access-control-allow-credentials']
          ).toBeUndefined();
        });
      }
    });
  });

  describe('asset fallback', () => {
    test('serves /assets/index.html if no root exists', async () => {
      const app = new LocalDevelopmentServer(9000, {
        ...BASE_CONFIG,
        routes: {
          assets: [
            {
              name: '/assets/index.html',
              path: '/assets/index.html',
              filePath: resolve(TEST_ASSETS_DIR, 'index.html'),
              content: '',
              access: 'public',
            },
          ],
          functions: [],
        },
        forkProcess: false,
      } as ServerConfig).getApp();

      const response = await request(app).get('/');
      expect(response.statusCode).toEqual(200);
      expect(response.text).toEqual('<html><body>Hi there!</body></html>');
    });

    test('returns 404 if no /assets/index.html & no root exists', async () => {
      const app = new LocalDevelopmentServer(9000, {
        ...BASE_CONFIG,
        routes: {
          assets: [],
          functions: [],
        },
        forkProcess: false,
      } as ServerConfig).getApp();

      const response = await request(app).get('/');
      expect(response.statusCode).toEqual(404);
      expect(response.text).toEqual('Could not find requested resource');
    });

    test('returns root if it exists', async () => {
      const app = new LocalDevelopmentServer(9000, {
        ...BASE_CONFIG,
        routes: {
          assets: [
            {
              name: '/',
              path: '/',
              filePath: resolve(TEST_ASSETS_DIR, 'index.html'),
              content: '',
              access: 'public',
            },
          ],
          functions: [],
        },
        forkProcess: false,
      } as ServerConfig).getApp();

      const response = await request(app).get('/');
      expect(response.statusCode).toEqual(200);
      expect(response.text).toEqual('<html><body>Hi there!</body></html>');
    });
  });

  describe('with forked process function handling', () => {
    beforeAll(async () => {
      app = new LocalDevelopmentServer(9000, {
        ...BASE_CONFIG,
        routes: { assets: availableAssets, functions: availableFunctions },
        forkProcess: true,
      } as ServerConfig).getApp();
    });

    describe('Function integration tests', () => {
      for (const testFnCode of availableFunctions) {
        test(`${testFnCode.name} should match snapshot`, async () => {
          const response = await request(app).get(testFnCode.path);
          if (response.status === 500) {
            expect(response.text).toMatch(/Error/);
          } else {
            const result = responseToSnapshotJson(response as InternalResponse);
            expect(result).toMatchSnapshot();
          }
        });
      }
    });
  });
});
