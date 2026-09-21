import { mocked } from 'jest-mock';
import checkNodejsVersion from '../../src/checks/nodejs-version';
import { logger } from '../../src/utils/logger';

jest.mock('../../src/utils/logger', () => {
  return {
    logger: {
      warn: jest.fn(),
    },
  };
});

const originalVersion = process.versions.node;

function setNodeVersion(version: string) {
  Object.defineProperty(process.versions, 'node', {
    value: version,
    configurable: true,
  });
}

describe('checkNodejsVersion', () => {
  beforeEach(() => {
    mocked(logger.warn).mockClear();
  });

  afterEach(() => {
    setNodeVersion(originalVersion);
  });

  test('should warn on deprecated Node.js versions', () => {
    ['20.11.1', '18.19.0', '16.20.2'].forEach((version) => {
      mocked(logger.warn).mockClear();
      setNodeVersion(version);
      checkNodejsVersion();
      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(mocked(logger.warn).mock.calls[0][0]).toContain(version);
    });
  });

  test('should not warn on currently supported Node.js versions', () => {
    ['22.11.0', '24.0.0'].forEach((version) => {
      setNodeVersion(version);
      checkNodejsVersion();
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test('should not warn on Node.js versions newer than this release knows about', () => {
    // An older toolkit must not tell users a newer Node.js version is invalid.
    ['26.0.0', '28.1.0'].forEach((version) => {
      setNodeVersion(version);
      checkNodejsVersion();
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
