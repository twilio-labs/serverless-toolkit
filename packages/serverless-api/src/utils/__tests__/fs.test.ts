import { checkForValidPath, getPathAndAccessFromFileInfo } from '../fs';

describe('checkForValidPath', () => {
  describe('check for valid paths', () => {
    const validPaths = [
      '/',
      '/index.html',
      '/styles.css',
      '/sms',
      '/webhooks/voice',
      '/tokens/chat-access',
    ];

    for (const path of validPaths) {
      test(`valid: ${path}`, () => {
        const result = checkForValidPath(path);
        expect(result).toEqual({ valid: true });
      });
    }
  });

  describe('check for invalid paths', () => {
    const invalidPaths = [
      '/?',
      '/index:sample.html',
      '/styles(1).css',
      '/$money',
      '/webhooks/@voice',
      `/${'x'.repeat(256)}`,
      '/index.html#hash',
      'relative-path',
    ];

    for (const path of invalidPaths) {
      test(`valid: ${path}`, () => {
        const result = checkForValidPath(path);
        expect(result.valid).toBe(false);
        //@ts-ignore
        expect(result.message).toBeDefined();
      });
    }
  });
});

describe('getPathAndAccessFromFileInfo', () => {
  test('detects public functions', () => {
    const result = getPathAndAccessFromFileInfo(
      {
        name: '/hello/example.js',
        path: '/hello/example.js',
      },
      '.js'
    );

    expect(result.access).toBe('public');
    expect(result.path).toBe('/hello/example');
  });

  test('detects protected functions', () => {
    const result = getPathAndAccessFromFileInfo(
      {
        name: '/hello/example.protected.js',
        path: '/hello/example.protected.js',
      },
      '.js'
    );

    expect(result.access).toBe('protected');
    expect(result.path).toBe('/hello/example');
  });

  test('detects private functions', () => {
    const result = getPathAndAccessFromFileInfo(
      {
        name: '/hello/example.private.js',
        path: '/hello/example.private.js',
      },
      '.js'
    );

    expect(result.access).toBe('private');
    expect(result.path).toBe('/hello/example');
  });

  test('detects public assets', () => {
    const result = getPathAndAccessFromFileInfo({
      name: '/hello/example.js',
      path: '/hello/example.js',
    });

    expect(result.access).toBe('public');
    expect(result.path).toBe('/hello/example.js');
  });

  test('detects protected assets', () => {
    const result = getPathAndAccessFromFileInfo({
      name: '/hello/example.protected.js',
      path: '/hello/example.protected.js',
    });

    expect(result.access).toBe('protected');
    expect(result.path).toBe('/hello/example.js');
  });

  test('detects private assets', () => {
    const result = getPathAndAccessFromFileInfo({
      name: '/hello/example.private.js',
      path: '/hello/example.private.js',
    });

    expect(result.access).toBe('private');
    expect(result.path).toBe('/hello/example.js');
  });

  test('throws error for file resulting in invalid path', () => {
    expect(() => {
      const result = getPathAndAccessFromFileInfo({
        name: '/hello/example#1.private.js',
        path: '/hello/example#1.private.js',
      });
    }).toThrowError('Path cannot contain a #. Got: "/hello/example#1.js');
  });
});
