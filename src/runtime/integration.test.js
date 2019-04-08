jest.unmock('twilio');

const request = require('supertest');
const { createServer } = require('./server');
const { resolve, basename } = require('path');
const cheerio = require('cheerio');
const { readdirSync } = require('fs');

const TEST_DIR = resolve(__dirname, '../fixtures');
const TEST_FUNCTIONS_DIR = resolve(TEST_DIR, 'functions');
const TEST_ENV = {};

const app = createServer(9000, {
  baseDir: TEST_DIR,
  env: TEST_ENV,
  logs: false,
});

const availableFunctions = readdirSync(TEST_FUNCTIONS_DIR).map(name => {
  const path = resolve(TEST_FUNCTIONS_DIR, name);
  const url = `/${basename(name, '.js')}`;
  return { name, url, path };
});

function responseToSnapshotJson(response) {
  const { statusCode, type, body, text, headers } = response;
  delete headers['date'];
  return {
    statusCode,
    type,
    body,
    text,
    headers,
  };
}

describe('Function integration tests', () => {
  for (const testFnCode of availableFunctions) {
    test(`${testFnCode.name} should match snapshot`, async () => {
      const response = await request(app).get(testFnCode.url);
      expect(response.statusCode).toBe(200);
      const result = responseToSnapshotJson(response);
      expect(result).toMatchSnapshot();
    });
  }
});
