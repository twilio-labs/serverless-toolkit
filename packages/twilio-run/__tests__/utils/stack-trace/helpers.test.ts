import { stripIndent } from 'common-tags';
import path from 'path';
import {
  formatStackTraceWithInternals,
  MODULE_ROOT,
  stringifyStackTrace,
} from '../../../src/utils/stack-trace/helpers';

function generateMockCallSite(
  str = `someTest (randomFakeFile.js:10:10)`,
  fileName = 'randomFakeFile.js'
) {
  return {
    getThis: jest.fn(),
    getTypeName: jest.fn(),
    getFunction: jest.fn(),
    getFunctionName: jest.fn(),
    getMethodName: jest.fn(),
    getFileName: jest.fn().mockReturnValue(fileName),
    getLineNumber: jest.fn(),
    getColumnNumber: jest.fn(),
    getEvalOrigin: jest.fn(),
    isToplevel: jest.fn(),
    isEval: jest.fn(),
    isNative: jest.fn(),
    isConstructor: jest.fn(),
    isAsync: jest.fn(),
    isPromiseAll: jest.fn(),
    getPromiseIndex: jest.fn(),
    toString: () => {
      return str;
    },
  };
}

describe('MODULE_ROOT', () => {
  test('module root points at root of source code', () => {
    expect(MODULE_ROOT.endsWith('src')).toBe(true);
  });
});

describe('stringifyStackTrace', () => {
  test('formats error correctly', () => {
    const err = new Error('Test error message');
    err.name = 'FakeTestError';
    const callsites = [generateMockCallSite()];
    const stackString = stringifyStackTrace(err, callsites);
    expect(stackString).toEqual(stripIndent`
    FakeTestError: Test error message
        at someTest (randomFakeFile.js:10:10)
    `);
  });

  test('handles multiple callsites', () => {
    const err = new Error('Test error message');
    err.name = 'FakeTestError';
    const callsites = [
      generateMockCallSite(),
      generateMockCallSite('anotherTest (randomFakeFile.js:20:0)'),
    ];
    const stackString = stringifyStackTrace(err, callsites);
    expect(stackString).toEqual(stripIndent`
    FakeTestError: Test error message
        at someTest (randomFakeFile.js:10:10)
        at anotherTest (randomFakeFile.js:20:0)
    `);
  });
});

describe('formatStackTraceWithInternals', () => {
  test('does not add "internals" footer if no internals', () => {
    const err = new Error('Test error message');
    err.name = 'FakeTestError';
    const callsites = [generateMockCallSite()];
    const stackString = formatStackTraceWithInternals(err, callsites);
    expect(stackString).toEqual(stripIndent`
    FakeTestError: Test error message
        at someTest (randomFakeFile.js:10:10)
    `);
  });

  test('adds "internals" footer if internals are present', () => {
    const err = new Error('Test error message');
    err.name = 'FakeTestError';
    const callsites = [
      generateMockCallSite(),
      generateMockCallSite(
        'randomInternalThatShouldBeRemoved (randomFakeFile.js:20:0)',
        path.join(MODULE_ROOT, 'randomFakeFile.js')
      ),
    ];
    const stackString = formatStackTraceWithInternals(err, callsites);
    expect(stackString).toEqual(stripIndent`
    FakeTestError: Test error message
        at someTest (randomFakeFile.js:10:10)
        at [Twilio Dev Server internals]
    `);
  });
});
