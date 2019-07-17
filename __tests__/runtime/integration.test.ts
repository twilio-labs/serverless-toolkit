jest.unmock('twilio');

import { Express } from 'express';
import { readdirSync } from 'fs';
import { basename, resolve } from 'path';
import request from 'supertest';
import { StartCliConfig } from '../../src/config/start';
import { createServer } from '../../src/runtime/server';

const TEST_DIR = resolve(__dirname, '../../fixtures');

const TEST_FUNCTIONS_DIR = resolve(TEST_DIR, 'functions');
const TEST_ENV = {};

const availableFunctions = readdirSync(TEST_FUNCTIONS_DIR).map(
  (name: string) => {
    const path = resolve(TEST_FUNCTIONS_DIR, name);
    const url = `/${basename(name, '.js')}`;
    return { name, url, path };
  }
);

type InternalResponse = request.Response & {
  statusCode: number;
  headers: {
    [key: string]: string | undefined;
  };
};

function responseToSnapshotJson(response: InternalResponse) {
  let { statusCode, type, body, text, headers } = response;
  delete headers['date'];

  if (text && text.startsWith('Error')) {
    // stack traces are different in every environment
    // let's not snapshot values that rely on it
    text = `${text.split('\n')[0]} ...`;
    delete headers['content-length'];
    delete headers['etag'];
  }

  return {
    statusCode,
    type,
    body,
    text,
    headers,
  };
}

describe('Function integration tests', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createServer(9000, {
      baseDir: TEST_DIR,
      env: TEST_ENV,
      logs: false,
    } as StartCliConfig);
  });

  for (const testFnCode of availableFunctions) {
    test(`${testFnCode.name} should match snapshot`, async () => {
      const response = await request(app).get(testFnCode.url);
      const result = responseToSnapshotJson(response as InternalResponse);
      expect(result).toMatchSnapshot();
    });
  }
});
