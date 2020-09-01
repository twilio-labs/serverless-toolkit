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
      'https://raw.githubusercontent.com/twilio-labs/function-templates/main/templates.json'
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
      'https://raw.githubusercontent.com/dkundel/function-templates/main/templates.json'
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

describe('with a mocked GitHub API', () => {
  const gitHubApi = nock('https://api.github.com');

  afterEach(() => {
    gitHubApi.done();
  });

  describe('getTemplateFiles', () => {
    test('contacts the GitHub API', async () => {
      const { getTemplateFiles } = require('../../src/templating/data');

      const basePath = '/repos/twilio-labs/function-templates/contents/blank';
      const templateContentScope = gitHubApi
        .get(`${basePath}?ref=main`)
        .reply(200, []);
      const result = await getTemplateFiles('blank');

      expect(result).toEqual([]);
      expect(templateContentScope.isDone()).toBeTruthy();
    });
  });

  describe('getFiles', () => {
    const { getFiles } = require('../../src/templating/data');

    test('gets a template directory from GH and translate to template file info', async () => {
      const basePath =
        '/repos/twilio-labs/function-templates/contents/blank/functions';
      const templateContentScope = gitHubApi
        .get(`${basePath}?ref=main`)
        .reply(200, [
          {
            name: 'blank.js',
            path: 'blank/functions/blank.js',
            sha: '8ffaf92aea1c5cd224fafa30165462c9eb0214bd',
            size: 80,
            url:
              'https://api.github.com/repos/twilio-labs/function-templates/contents/blank/functions/blank.js?ref=main',
            html_url:
              'https://github.com/twilio-labs/function-templates/blob/main/blank/functions/blank.js',
            git_url:
              'https://api.github.com/repos/twilio-labs/function-templates/git/blobs/8ffaf92aea1c5cd224fafa30165462c9eb0214bd',
            download_url:
              'https://raw.githubusercontent.com/twilio-labs/function-templates/main/blank/functions/blank.js',
            type: 'file',
            _links: {
              self:
                'https://api.github.com/repos/twilio-labs/function-templates/contents/blank/functions/blank.js?ref=main',
              git:
                'https://api.github.com/repos/twilio-labs/function-templates/git/blobs/8ffaf92aea1c5cd224fafa30165462c9eb0214bd',
              html:
                'https://github.com/twilio-labs/function-templates/blob/main/blank/functions/blank.js',
            },
          },
        ]);

      const files = await getFiles('blank', 'functions');
      expect(files.length).toEqual(1);
      const file = files[0];
      expect(file.directory).toEqual('');
      expect(file.name).toEqual('blank.js');
      expect(file.type).toEqual('functions');
      expect(file.content).toEqual(
        'https://raw.githubusercontent.com/twilio-labs/function-templates/main/blank/functions/blank.js'
      );
    });

    test('gets a template directory with nested functions from GH and translate to template file info', async () => {
      const basePath =
        '/repos/twilio-labs/function-templates/contents/nested/functions';
      gitHubApi.get(`${basePath}?ref=main`).reply(200, [
        {
          name: 'blank.js',
          path: 'nested/functions/blank.js',
          sha: '8ffaf92aea1c5cd224fafa30165462c9eb0214bd',
          size: 80,
          url:
            'https://api.github.com/repos/twilio-labs/function-templates/contents/nested/functions/blank.js?ref=main',
          html_url:
            'https://github.com/twilio-labs/function-templates/blob/main/nested/functions/blank.js',
          git_url:
            'https://api.github.com/repos/twilio-labs/function-templates/git/blobs/8ffaf92aea1c5cd224fafa30165462c9eb0214bd',
          download_url:
            'https://raw.githubusercontent.com/twilio-labs/function-templates/main/nested/functions/blank.js',
          type: 'file',
        },
        {
          name: 'admin',
          path: 'blank/functions/admin',
          sha: '2e5bf79f4c70ad016b93e5563374867b18078d60',
          size: 0,
          url:
            'https://api.github.com/repos/twilio-labs/function-templates/contents/nested/functions/admin',
          html_url:
            'https://github.com/twilio-labs/function-templates/tree/nested-directory/nested-directory/functions/admin',
          git_url:
            'https://api.github.com/repos/twilio-labs/function-templates/git/trees/2e5bf79f4c70ad016b93e5563374867b18078d60',
          download_url: null,
          type: 'dir',
        },
      ]);
      gitHubApi
        .get(
          `/repos/twilio-labs/function-templates/contents/nested/functions/admin`
        )
        .reply(200, [
          {
            name: 'admin.js',
            path: 'nested/functions/admin/admin.js',
            sha: '83f046ef49a8207b6876393074f638842590bccb',
            size: 116,
            url:
              'https://api.github.com/repos/twilio-labs/function-templates/contents/nested-directory/functions/admin/admin.js?ref=nested-directory',
            html_url:
              'https://github.com/twilio-labs/function-templates/blob/nested-directory/nested-directory/functions/admin/admin.js',
            git_url:
              'https://api.github.com/repos/twilio-labs/function-templates/git/blobs/83f046ef49a8207b6876393074f638842590bccb',
            download_url:
              'https://raw.githubusercontent.com/twilio-labs/function-templates/nested-directory/nested-directory/functions/admin/admin.js',
            type: 'file',
          },
        ]);

      const files = await getFiles('nested', 'functions');
      expect(files.length).toEqual(2);
      const file = files[0];
      expect(file.directory).toEqual('');
      expect(file.name).toEqual('blank.js');
      expect(file.type).toEqual('functions');
      expect(file.content).toEqual(
        'https://raw.githubusercontent.com/twilio-labs/function-templates/main/nested/functions/blank.js'
      );
      const nestedFile = files[1];
      expect(nestedFile.directory).toEqual('admin');
      expect(nestedFile.name).toEqual('admin.js');
      expect(nestedFile.type).toEqual('functions');
      expect(nestedFile.content).toEqual(
        'https://raw.githubusercontent.com/twilio-labs/function-templates/nested-directory/nested-directory/functions/admin/admin.js'
      );
    });
  });
});
