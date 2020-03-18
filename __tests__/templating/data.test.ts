jest.mock('../../src/utils/logger');

import nock from 'nock';

afterEach(() => {
  jest.resetModules();
  delete process.env.TWILIO_SERVERLESS_TEMPLATE_BRANCH;
  delete process.env.TWILIO_SERVERLESS_TEMPLATE_REPO;
});

describe('base API configuration', () => {
  test('has the right default values', () => {
    const {
      TEMPLATES_URL,
      CONTENT_BASE_URL,
    } = require('../../src/templating/data');

    expect(TEMPLATES_URL).toBe(
      'https://raw.githubusercontent.com/twilio-labs/function-templates/master/templates.json'
    );
    expect(CONTENT_BASE_URL).toBe(
      'https://api.github.com/repos/twilio-labs/function-templates/contents'
    );
  });

  test('allows to override repo', () => {
    process.env.TWILIO_SERVERLESS_TEMPLATE_REPO = 'dkundel/function-templates';

    const {
      TEMPLATES_URL,
      CONTENT_BASE_URL,
    } = require('../../src/templating/data');

    expect(TEMPLATES_URL).toBe(
      'https://raw.githubusercontent.com/dkundel/function-templates/master/templates.json'
    );
    expect(CONTENT_BASE_URL).toBe(
      'https://api.github.com/repos/dkundel/function-templates/contents'
    );
  });

  test('allows to override base branch', () => {
    process.env.TWILIO_SERVERLESS_TEMPLATE_BRANCH = 'next';

    const {
      TEMPLATES_URL,
      CONTENT_BASE_URL,
    } = require('../../src/templating/data');

    expect(TEMPLATES_URL).toBe(
      'https://raw.githubusercontent.com/twilio-labs/function-templates/next/templates.json'
    );
    expect(CONTENT_BASE_URL).toBe(
      'https://api.github.com/repos/twilio-labs/function-templates/contents'
    );
  });

  test('allows to override branch and repo', () => {
    process.env.TWILIO_SERVERLESS_TEMPLATE_REPO = 'philnash/function-templates';
    process.env.TWILIO_SERVERLESS_TEMPLATE_BRANCH = 'development';

    const {
      TEMPLATES_URL,
      CONTENT_BASE_URL,
    } = require('../../src/templating/data');

    expect(TEMPLATES_URL).toBe(
      'https://raw.githubusercontent.com/philnash/function-templates/development/templates.json'
    );
    expect(CONTENT_BASE_URL).toBe(
      'https://api.github.com/repos/philnash/function-templates/contents'
    );
  });
});

describe('getTemplateFiles', () => {
  const gitHubApi = nock('https://api.github.com');

  afterEach(() => {
    gitHubApi.done();
  });

  test('contacts the GitHub API', async () => {
    const { getTemplateFiles } = require('../../src/templating/data');

    const basePath = '/repos/twilio-labs/function-templates/contents/blank';
    const templateContentScope = gitHubApi
      .get(`${basePath}?ref=master`)
      .reply(200, []);
    const result = await getTemplateFiles('blank');

    expect(result).toEqual([]);
    expect(templateContentScope.isDone()).toBeTruthy();
  });
});
