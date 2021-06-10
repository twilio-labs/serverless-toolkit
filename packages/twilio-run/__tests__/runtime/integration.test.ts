jest.unmock('twilio');

import { Express } from 'express';
import { readdirSync } from 'fs';
import { basename, resolve } from 'path';
import request from 'supertest';
import { StartCliConfig } from '../../src/config/start';
import { createServer } from '../../src/runtime/server';

const TEST_DIR = resolve(__dirname, '../../fixtures');

const TEST_FUNCTIONS_DIR = resolve(TEST_DIR, 'functions');
const TEST_ASSETS_DIR = resolve(TEST_DIR, 'assets');
const TEST_ENV = {};

const availableFunctions = readdirSync(TEST_FUNCTIONS_DIR).map(
  (name: string) => {
    const path = resolve(TEST_FUNCTIONS_DIR, name);
    const url = `/${basename(name, '.js')}`;
    return { name, url, path };
  }
);
const availableAssets = readdirSync(TEST_ASSETS_DIR).map((name: string) => {
  const path = resolve(TEST_ASSETS_DIR, name);
  const url = `/${name}`;
  return { name, url, path };
});

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
      app = await createServer(9000, {
        baseDir: TEST_DIR,
        env: TEST_ENV,
        logs: false,
      } as StartCliConfig);
    });

    describe('Function integration tests', () => {
      for (const testFnCode of availableFunctions) {
        test(`${testFnCode.name} should match snapshot`, async () => {
          const response = await request(app).get(testFnCode.url);
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
          const response = await request(app).get(testAsset.url);
          const result = responseToSnapshotJson(response as InternalResponse);
          expect(result).toMatchSnapshot();
        });

        test(`OPTIONS request to ${testAsset.name} should return CORS headers and no body`, async () => {
          const response = (await request(app).options(
            testAsset.url
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
            testAsset.url
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
  describe('with forked process function handling', () => {
    beforeAll(async () => {
      app = await createServer(9000, {
        baseDir: TEST_DIR,
        env: TEST_ENV,
        logs: false,
        forkProcess: true,
      } as StartCliConfig);
    });

    describe('Function integration tests', () => {
      for (const testFnCode of availableFunctions) {
        test(`${testFnCode.name} should match snapshot`, async () => {
          const response = await request(app).get(testFnCode.url);
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
