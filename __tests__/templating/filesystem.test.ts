jest.mock('listr/lib/renderer');
jest.mock('@twilio-labs/serverless-api');
jest.mock('got');
jest.mock('pkg-install');
jest.mock('../../src/utils/fs');
jest.mock('../../src/utils/logger');

import path from 'path';
import { install } from 'pkg-install';
import { fsHelpers } from '@twilio-labs/serverless-api';
import got from 'got';
import { mocked } from 'ts-jest/utils';
import { writeFiles } from '../../src/templating/filesystem';
import { downloadFile, fileExists, readFile, writeFile, mkdir } from '../../src/utils/fs';

beforeEach(() => {
  // For our test, replace the `listr` renderer with a silent one so the tests
  // don't get confusing output in them.
  const {getRenderer} = jest.requireMock('listr/lib/renderer');
  mocked(getRenderer).mockImplementation(() => require('listr-silent-renderer'));
});

afterEach(() => {jest.resetAllMocks(); jest.restoreAllMocks() });

test('bubbles up an exception when functions directory is missing', async () => {
  // For this test, getFirstMatchingDirectory always errors
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation((basePath: string, directories: Array<string>): string => {
    throw new Error(`Could not find any of these directories "${directories.join('", "')}"`);
  });

  await expect(writeFiles([], './testing/', 'example'))
      .rejects.toThrowError('Could not find any of these directories "functions", "src"');
});

test('bubbles up an exception when assets directory is missing', async () => {
  // For this test, getFirstMatchingDirectory only errors on `assets` directory.
  mocked(fsHelpers.getFirstMatchingDirectory).mockImplementation((basePath: string, directories: Array<string>): string => {
    if (directories.includes('functions')) {
      return path.join(basePath, directories[0]);
    }

    throw new Error(`Could not find any of these directories "${directories.join('", "')}"`);
  });

  await expect(writeFiles([], './testing/', 'example'))
      .rejects.toThrowError('Could not find any of these directories "assets", "static"');
});

test('installation with basic functions', async () => {
  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory)
    .mockImplementation((basePath: string, directories: Array<string>): string => path.join(basePath, directories[0]));

  await writeFiles(
    [
      { name: 'hello.js',  type: 'functions',  content: 'https://example.com/hello.js' },
      { name: '.env',  type: '.env',  content: 'https://example.com/.env' },
    ],
    './testing/',
    'example'
  );

  expect(downloadFile).toHaveBeenCalledTimes(2);
  expect(downloadFile).toHaveBeenCalledWith('https://example.com/.env', 'testing/.env');
  expect(downloadFile).toHaveBeenCalledWith('https://example.com/hello.js', 'testing/functions/example/hello.js');

  expect(mkdir).toHaveBeenCalledTimes(1);
  expect(mkdir).toHaveBeenCalledWith('testing/functions/example', {recursive: true});
});

test('installation with functions and assets', async () => {
  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory)
    .mockImplementation((basePath: string, directories: Array<string>): string => path.join(basePath, directories[0]));

  await writeFiles(
    [
      { name: 'hello.js',  type: 'functions',  content: 'https://example.com/hello.js' },
      { name: 'hello.wav',  type: 'assets',  content: 'https://example.com/hello.wav' },
      { name: '.env',  type: '.env',  content: 'https://example.com/.env' },
    ],
    './testing/',
    'example'
  );

  expect(downloadFile).toHaveBeenCalledTimes(3);
  expect(downloadFile).toHaveBeenCalledWith('https://example.com/.env', 'testing/.env');
  expect(downloadFile).toHaveBeenCalledWith('https://example.com/hello.js', 'testing/functions/example/hello.js');
  expect(downloadFile).toHaveBeenCalledWith('https://example.com/hello.wav', 'testing/assets/example/hello.wav');

  expect(mkdir).toHaveBeenCalledTimes(2);
  expect(mkdir).toHaveBeenCalledWith('testing/functions/example', {recursive: true});
  expect(mkdir).toHaveBeenCalledWith('testing/assets/example', {recursive: true});
});

test('installation without dot-env file causes unexpected crash', async () => {
  // I don't believe this is the intended behavior but it's the current behavior.
  // As such, let's create a test for it which can be removed / changed later
  // once the behavior is fixed.

  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory)
    .mockImplementation((basePath: string, directories: Array<string>): string => path.join(basePath, directories[0]));

  const expected = new TypeError('Cannot read property \'newEnvironmentVariableKeys\' of undefined');

  await expect(writeFiles([], './testing/', 'example'))
    .rejects.toThrowError(expected);
});

test('installation with an empty dependency file', async () => {
  // The typing of `got` is not exactly correct for this - it expects a
  // buffer but depending on inputs `got` can actually return an object.
  // @ts-ignore
  mocked(got).mockImplementation(() => Promise.resolve({ body: { dependencies: {} } }));

  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory)
    .mockImplementation((basePath: string, directories: Array<string>): string => path.join(basePath, directories[0]));

  await writeFiles(
    [
      { name: 'package.json',  type: 'package.json',  content: 'https://example.com/package.json' },
      { name: '.env',  type: '.env',  content: 'https://example.com/.env' },
    ],
    './testing/',
    'example'
  );

  expect(downloadFile).toHaveBeenCalledTimes(1);
  expect(downloadFile).toHaveBeenCalledWith('https://example.com/.env', 'testing/.env');

  expect(got).toHaveBeenCalledTimes(1);
  expect(got).toHaveBeenCalledWith('https://example.com/package.json', { json: true });

  expect(install).not.toHaveBeenCalled();
});

test('installation with a dependency file', async () => {
  // The typing of `got` is not exactly correct for this - it expects a
  // buffer but depending on inputs `got` can actually return an object.
  // @ts-ignore
  mocked(got).mockImplementation(() => Promise.resolve({ body: { dependencies: {foo: '^1.0.0', got: '^6.9.0'} } }));

  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory)
    .mockImplementation((basePath: string, directories: Array<string>): string => path.join(basePath, directories[0]));

  await writeFiles(
    [
      { name: 'package.json',  type: 'package.json',  content: 'https://example.com/package.json' },
      { name: '.env',  type: '.env',  content: 'https://example.com/.env' },
    ],
    './testing/',
    'example'
  );

  expect(downloadFile).toHaveBeenCalledTimes(1);
  expect(downloadFile).toHaveBeenCalledWith('https://example.com/.env', 'testing/.env');

  expect(got).toHaveBeenCalledTimes(1);
  expect(got).toHaveBeenCalledWith('https://example.com/package.json', { json: true });

  expect(install).toHaveBeenCalledTimes(1);
  expect(install).toHaveBeenCalledWith({foo: '^1.0.0', got: '^6.9.0'}, {cwd: './testing/'});
});

test('installation with an existing dot-env file', async () => {
  mocked(fileExists).mockReturnValue(Promise.resolve(true));
  mocked(readFile).mockReturnValue(Promise.resolve('# Comment\nFOO=BAR\n'));

  // The typing of `got` is not exactly correct for this - it expects a
  // buffer but depending on inputs `got` can actually return an object.
  // @ts-ignore
  mocked(got).mockImplementation(() => Promise.resolve({ body: 'HELLO=WORLD\n' }));

  // For this test, getFirstMatchingDirectory never errors.
  mocked(fsHelpers.getFirstMatchingDirectory)
    .mockImplementation((basePath: string, directories: Array<string>): string => path.join(basePath, directories[0]));

  await writeFiles(
    [
      { name: '.env',  type: '.env',  content: 'https://example.com/.env' },
    ],
    './testing/',
    'example'
  );

  expect(downloadFile).toHaveBeenCalledTimes(0);

  expect(writeFile).toHaveBeenCalledTimes(1);
  expect(writeFile).toHaveBeenCalledWith(
    'testing/.env',
    '# Comment\n' +
    'FOO=BAR\n' +
    '\n\n' +
    '# Variables for function \".env\"\n' + // This seems to be a bug but is the output.
    '# ---\n' +
    'HELLO=WORLD\n',
    "utf8"
  );
});

test('installation with overlapping function files throws errors before writing', async () => {
  mocked(fsHelpers.getFirstMatchingDirectory)
    .mockImplementation((basePath: string, directories: Array<string>): string => path.join(basePath, directories[0]));

  mocked(fileExists).mockImplementation((p) => Promise.resolve(p == 'functions/example/hello.js'));

  await expect(writeFiles(
    [
      { name: 'hello.js',  type: 'functions',  content: 'https://example.com/hello.js' },
      { name: '.env',  type: '.env',  content: 'https://example.com/.env' },
    ],
    './',
    'example'
  )).rejects.toThrowError('Template with name "example" has duplicate file "hello.js" in "functions"');

  expect(downloadFile).toHaveBeenCalledTimes(0);
  expect(writeFile).toHaveBeenCalledTimes(0);

});

test('installation with overlapping asset files throws errors before writing', async () => {
  mocked(fsHelpers.getFirstMatchingDirectory)
    .mockImplementation((basePath: string, directories: Array<string>): string => path.join(basePath, directories[0]));

  mocked(fileExists).mockImplementation((p) => Promise.resolve(p == 'assets/example/hello.wav'));

  await expect(writeFiles(
    [
      { name: 'hello.js',  type: 'functions',  content: 'https://example.com/hello.js' },
      { name: 'hello.wav',  type: 'assets',  content: 'https://example.com/hello.wav' },
      { name: '.env',  type: '.env',  content: 'https://example.com/.env' },
    ],
    './',
    'example'
  )).rejects.toThrowError('Template with name "example" has duplicate file "hello.wav" in "assets"');

  expect(downloadFile).toHaveBeenCalledTimes(0);
  expect(writeFile).toHaveBeenCalledTimes(0);
});