jest.mock('listr/lib/renderer');
jest.mock('@twilio-labs/serverless-api');
jest.mock('got');
jest.mock('pkg-install');
jest.mock('../../src/utils/fs');
jest.mock('../../src/utils/logger');

import { fsHelpers } from '@twilio-labs/serverless-api';
import got from 'got';
import path, { join } from 'path';
import { install } from 'pkg-install';
import { mocked } from 'jest-mock';
import { writeFiles } from '../../src/templating/filesystem';
import {
  downloadFile,
  fileExists,
  mkdir,
  readFile,
  writeFile,
} from '../../src/utils/fs';

beforeEach(() => {
  // For our test, replace the `listr` renderer with a silent one so the tests
  // don't get confusing output in them.
  const { getRenderer } = jest.requireMock('listr/lib/renderer');
  mocked(getRenderer).mockImplementation(() =>
    require('listr-silent-renderer')
  );
});

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

test('bubbles up an exception when functions directory is missing', async () => {
  // For this test, getFirstMatchingDirectory always errors
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation(
    (basePath: string, directories: Array<string>): string => {
      throw new Error(
        `Could not find any of these directories "${directories.join('", "')}"`
      );
    }
  );

  await expect(
    writeFiles([], './testing/', 'example', 'hello')
  ).rejects.toThrowError(
    'Could not find any of these directories "functions", "src"'
  );
});

test('bubbles up an exception when assets directory is missing', async () => {
  // For this test, getFirstMatchingDirectory only errors on `assets` directory.
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation(
    (basePath: string, directories: Array<string>): string => {
      if (directories.includes('functions')) {
        return path.join(basePath, directories[0]);
      }

      throw new Error(
        `Could not find any of these directories "${directories.join('", "')}"`
      );
    }
  );

  await expect(
    writeFiles([], './testing/', 'example', 'hello')
  ).rejects.toThrowError(
    'Could not find any of these directories "assets", "static"'
  );
});

test('installation with basic functions', async () => {
  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation(
    (basePath: string, directories: Array<string>): string =>
      path.join(basePath, directories[0])
  );

  await writeFiles(
    [
      {
        name: 'hello.js',
        type: 'functions',
        content: 'https://example.com/hello.js',
        directory: '',
      },
      {
        name: '.env',
        type: '.env',
        content: 'https://example.com/.env',
        directory: '',
      },
      {
        name: 'README.md',
        type: 'README.md',
        content: 'https://example.com/README.md',
        directory: '',
      },
    ],
    './testing/',
    'example',
    'hello'
  );

  expect(downloadFile).toHaveBeenCalledTimes(3);
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/.env',
    join('testing', '.env')
  );
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/hello.js',
    join('testing', 'functions', 'example', 'hello.js')
  );
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/README.md',
    join('testing', 'readmes', 'example', 'hello.md')
  );

  expect(mkdir).toHaveBeenCalledTimes(2);
  expect(mkdir).toHaveBeenCalledWith(join('testing', 'functions', 'example'), {
    recursive: true,
  });
  expect(mkdir).toHaveBeenCalledWith(join('testing', 'readmes', 'example'), {
    recursive: true,
  });
});

test('installation with functions and assets', async () => {
  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation(
    (basePath: string, directories: Array<string>): string =>
      path.join(basePath, directories[0])
  );

  await writeFiles(
    [
      {
        name: 'hello.js',
        type: 'functions',
        content: 'https://example.com/hello.js',
        directory: '',
      },
      {
        name: 'hello.wav',
        type: 'assets',
        content: 'https://example.com/hello.wav',
        directory: '',
      },
      {
        name: '.env',
        type: '.env',
        content: 'https://example.com/.env',
        directory: '',
      },
    ],
    './testing/',
    'example',
    'hello'
  );

  expect(downloadFile).toHaveBeenCalledTimes(3);
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/.env',
    join('testing', '.env')
  );
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/hello.js',
    join('testing', 'functions', 'example', 'hello.js')
  );
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/hello.wav',
    join('testing', 'assets', 'example', 'hello.wav')
  );

  expect(mkdir).toHaveBeenCalledTimes(2);
  expect(mkdir).toHaveBeenCalledWith(join('testing', 'functions', 'example'), {
    recursive: true,
  });
  expect(mkdir).toHaveBeenCalledWith(join('testing', 'assets', 'example'), {
    recursive: true,
  });
});

test('installation with functions and assets and blank namespace', async () => {
  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation(
    (basePath: string, directories: Array<string>): string =>
      path.join(basePath, directories[0])
  );

  await writeFiles(
    [
      {
        name: 'hello.js',
        type: 'functions',
        content: 'https://example.com/hello.js',
        directory: '',
      },
      {
        name: 'hello.wav',
        type: 'assets',
        content: 'https://example.com/hello.wav',
        directory: '',
      },
      {
        name: 'README.md',
        type: 'README.md',
        content: 'https://example.com/README.md',
        directory: '',
      },
      {
        name: '.env',
        type: '.env',
        content: 'https://example.com/.env',
        directory: '',
      },
    ],
    './testing/',
    '',
    'hello'
  );

  expect(downloadFile).toHaveBeenCalledTimes(4);
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/.env',
    join('testing', '.env')
  );
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/hello.js',
    join('testing', 'functions', 'hello.js')
  );
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/hello.wav',
    join('testing', 'assets', 'hello.wav')
  );
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/README.md',
    join('testing', 'readmes', 'hello.md')
  );

  expect(mkdir).toHaveBeenCalledTimes(1);
  expect(mkdir).toHaveBeenCalledWith(join('testing', 'readmes'), {
    recursive: true,
  });
});

test('installation without dot-env file causes unexpected crash', async () => {
  // I don't believe this is the intended behavior but it's the current behavior.
  // As such, let's create a test for it which can be removed / changed later
  // once the behavior is fixed.

  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation(
    (basePath: string, directories: Array<string>): string =>
      path.join(basePath, directories[0])
  );

  const expected = new TypeError(
    "Cannot read property 'newEnvironmentVariableKeys' of undefined"
  );

  try {
    await writeFiles([], './testing/', 'example', 'hello');
  } catch (error) {
    expect(error.toString()).toMatch('TypeError: Cannot read');
  }
});

test('installation with an empty dependency file', async () => {
  // The typing of `got` is not exactly correct for this - it expects a
  // buffer but depending on inputs `got` can actually return an object.
  // @ts-ignore
  mocked(got).mockImplementation(() =>
    //@ts-ignore
    Promise.resolve({ body: { dependencies: {} } })
  );

  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation(
    (basePath: string, directories: Array<string>): string =>
      path.join(basePath, directories[0])
  );

  await writeFiles(
    [
      {
        name: 'package.json',
        type: 'package.json',
        content: 'https://example.com/package.json',
        directory: '',
      },
      {
        name: '.env',
        type: '.env',
        content: 'https://example.com/.env',
        directory: '',
      },
    ],
    './testing/',
    'example',
    'hello'
  );

  expect(downloadFile).toHaveBeenCalledTimes(1);
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/.env',
    join('testing', '.env')
  );

  expect(got).toHaveBeenCalledTimes(1);
  expect(got).toHaveBeenCalledWith('https://example.com/package.json', {
    responseType: 'json',
  });

  expect(install).not.toHaveBeenCalled();
});

test('installation with a dependency file', async () => {
  // The typing of `got` is not exactly correct for this - it expects a
  // buffer but depending on inputs `got` can actually return an object.
  // @ts-ignore
  mocked(got).mockImplementation(() =>
    // @ts-ignore
    Promise.resolve({
      body: { dependencies: { foo: '^1.0.0', got: '^6.9.0' } },
    })
  );

  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation(
    (basePath: string, directories: Array<string>): string =>
      path.join(basePath, directories[0])
  );

  await writeFiles(
    [
      {
        name: 'package.json',
        type: 'package.json',
        content: 'https://example.com/package.json',
        directory: '',
      },
      {
        name: '.env',
        type: '.env',
        content: 'https://example.com/.env',
        directory: '',
      },
    ],
    './testing/',
    'example',
    'hello'
  );

  expect(downloadFile).toHaveBeenCalledTimes(1);
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/.env',
    join('testing', '.env')
  );

  expect(got).toHaveBeenCalledTimes(1);
  expect(got).toHaveBeenCalledWith('https://example.com/package.json', {
    responseType: 'json',
  });

  expect(install).toHaveBeenCalledTimes(1);
  expect(install).toHaveBeenCalledWith(
    { foo: '^1.0.0', got: '^6.9.0' },
    { cwd: './testing/' }
  );
});

test('installation with a dependency file with exact dependencies', async () => {
  // The typing of `got` is not exactly correct for this - it expects a
  // buffer but depending on inputs `got` can actually return an object.
  // @ts-ignore
  mocked(got).mockImplementation(() =>
    // @ts-ignore
    Promise.resolve({
      body: { dependencies: { foo: '1.0.0', got: '6.9.0' } },
    })
  );

  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation(
    (basePath: string, directories: Array<string>): string =>
      path.join(basePath, directories[0])
  );

  await writeFiles(
    [
      {
        name: 'package.json',
        type: 'package.json',
        content: 'https://example.com/package.json',
        directory: '',
      },
      {
        name: '.env',
        type: '.env',
        content: 'https://example.com/.env',
        directory: '',
      },
    ],
    './testing/',
    'example',
    'hello'
  );

  expect(downloadFile).toHaveBeenCalledTimes(1);
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/.env',
    join('testing', '.env')
  );

  expect(got).toHaveBeenCalledTimes(1);
  expect(got).toHaveBeenCalledWith('https://example.com/package.json', {
    responseType: 'json',
  });

  expect(install).toHaveBeenCalledTimes(1);
  expect(install).toHaveBeenCalledWith(
    { foo: '1.0.0', got: '6.9.0' },
    { cwd: './testing/', exact: true }
  );
});

test('installation with a dependency file with mixed dependencies', async () => {
  // The typing of `got` is not exactly correct for this - it expects a
  // buffer but depending on inputs `got` can actually return an object.
  // @ts-ignore
  mocked(got).mockImplementation(() =>
    // @ts-ignore
    Promise.resolve({
      body: {
        dependencies: {
          foo: '^1.0.0',
          got: '6.9.0',
          twilio: '^3',
          '@twilio/runtime-handler': '1.2.0-rc.3',
        },
      },
    })
  );

  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation(
    (basePath: string, directories: Array<string>): string =>
      path.join(basePath, directories[0])
  );

  await writeFiles(
    [
      {
        name: 'package.json',
        type: 'package.json',
        content: 'https://example.com/package.json',
        directory: '',
      },
      {
        name: '.env',
        type: '.env',
        content: 'https://example.com/.env',
        directory: '',
      },
    ],
    './testing/',
    'example',
    'hello'
  );

  expect(downloadFile).toHaveBeenCalledTimes(1);
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/.env',
    join('testing', '.env')
  );

  expect(got).toHaveBeenCalledTimes(1);
  expect(got).toHaveBeenCalledWith('https://example.com/package.json', {
    responseType: 'json',
  });

  expect(install).toHaveBeenCalledTimes(2);
  expect(install).toHaveBeenCalledWith(
    { foo: '^1.0.0', twilio: '^3' },
    { cwd: './testing/' }
  );
  expect(install).toHaveBeenCalledWith(
    { got: '6.9.0', '@twilio/runtime-handler': '1.2.0-rc.3' },
    { cwd: './testing/', exact: true }
  );
});

test('installation with an existing dot-env file', async () => {
  mocked(fileExists).mockReturnValue(Promise.resolve(true));
  mocked(readFile).mockReturnValue(Promise.resolve('# Comment\nFOO=BAR\n'));

  // The typing of `got` is not exactly correct for this - it expects a
  // buffer but depending on inputs `got` can actually return an object.
  // @ts-ignore
  mocked(got).mockImplementation(() =>
    // @ts-ignore
    Promise.resolve({ body: 'HELLO=WORLD\n' })
  );

  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation(
    (basePath: string, directories: Array<string>): string =>
      path.join(basePath, directories[0])
  );

  await writeFiles(
    [
      {
        name: '.env',
        type: '.env',
        content: 'https://example.com/.env',
        directory: '',
      },
    ],
    './testing/',
    'example',
    'hello'
  );

  expect(downloadFile).toHaveBeenCalledTimes(0);

  expect(writeFile).toHaveBeenCalledTimes(1);
  expect(writeFile).toHaveBeenCalledWith(
    join('testing', '.env'),
    '# Comment\n' +
      'FOO=BAR\n' +
      '\n\n' +
      '# Variables for function "example"\n' +
      '# ---\n' +
      'HELLO=WORLD\n',
    'utf8'
  );
});

test('installation with overlapping function files throws errors before writing', async () => {
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation(
    (basePath: string, directories: Array<string>): string =>
      path.join(basePath, directories[0])
  );

  mocked(fileExists).mockImplementation((p) =>
    Promise.resolve(p == join('functions', 'example', 'hello.js'))
  );

  await expect(
    writeFiles(
      [
        {
          name: 'hello.js',
          type: 'functions',
          content: 'https://example.com/hello.js',
          directory: '',
        },
        {
          name: '.env',
          type: '.env',
          content: 'https://example.com/.env',
          directory: '',
        },
      ],
      './',
      'example',
      'hello'
    )
  ).rejects.toThrowError(
    'Template with name "example" has duplicate file "hello.js" in "functions"'
  );

  expect(downloadFile).toHaveBeenCalledTimes(0);
  expect(writeFile).toHaveBeenCalledTimes(0);
});

test('installation with overlapping asset files throws errors before writing', async () => {
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation(
    (basePath: string, directories: Array<string>): string =>
      path.join(basePath, directories[0])
  );

  mocked(fileExists).mockImplementation((p) =>
    Promise.resolve(p == join('assets', 'example', 'hello.wav'))
  );

  await expect(
    writeFiles(
      [
        {
          name: 'hello.js',
          type: 'functions',
          content: 'https://example.com/hello.js',
          directory: '',
        },
        {
          name: 'hello.wav',
          type: 'assets',
          content: 'https://example.com/hello.wav',
          directory: '',
        },
        {
          name: '.env',
          type: '.env',
          content: 'https://example.com/.env',
          directory: '',
        },
      ],
      join('.', path.sep),
      'example',
      'hello'
    )
  ).rejects.toThrowError(
    'Template with name "example" has duplicate file "hello.wav" in "assets"'
  );

  expect(downloadFile).toHaveBeenCalledTimes(0);
  expect(writeFile).toHaveBeenCalledTimes(0);
});

test('installation with functions and assets in nested directories', async () => {
  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation(
    (basePath: string, directories: Array<string>): string =>
      path.join(basePath, directories[0])
  );

  await writeFiles(
    [
      {
        name: 'hello.js',
        type: 'functions',
        content: 'https://example.com/hello.js',
        directory: 'admin',
      },
      {
        name: 'woohoo.jpg',
        type: 'assets',
        content: 'https://example.com/woohoo.jpg',
        directory: 'success',
      },
      {
        name: '.env',
        type: '.env',
        content: 'https://example.com/.env',
        directory: '',
      },
      {
        name: 'README.md',
        type: 'README.md',
        content: 'https://example.com/README.md',
        directory: '',
      },
    ],
    join('.', 'testing'),
    'example',
    'hello'
  );

  expect(downloadFile).toHaveBeenCalledTimes(4);
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/.env',
    join('testing', '.env')
  );
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/hello.js',
    join('testing', 'functions', 'example', 'admin', 'hello.js')
  );
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/README.md',
    join('testing', 'readmes', 'example', 'hello.md')
  );
  expect(downloadFile).toHaveBeenCalledWith(
    'https://example.com/woohoo.jpg',
    join('testing', 'assets', 'example', 'success', 'woohoo.jpg')
  );

  expect(mkdir).toHaveBeenCalledTimes(3);
  expect(mkdir).toHaveBeenCalledWith(join('testing', 'functions', 'example'), {
    recursive: true,
  });
  expect(mkdir).toHaveBeenCalledWith(join('testing', 'readmes', 'example'), {
    recursive: true,
  });
  expect(mkdir).toHaveBeenCalledWith(join('testing', 'assets', 'example'), {
    recursive: true,
  });
});
