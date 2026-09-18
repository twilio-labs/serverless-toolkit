import { mocked } from 'jest-mock';
import {
  checkForDeprecatedRuntime,
  DEPRECATED_RUNTIMES,
} from '../../src/checks/deprecated-runtime';
import { logger } from '../../src/utils/logger';

jest.mock('../../src/utils/logger', () => {
  return {
    logger: {
      warn: jest.fn(),
    },
  };
});

describe('checkForDeprecatedRuntime', () => {
  beforeEach(() => {
    mocked(logger.warn).mockClear();
  });

  test('should warn for every deprecated runtime', () => {
    DEPRECATED_RUNTIMES.forEach((runtime) => {
      expect(checkForDeprecatedRuntime(runtime)).toEqual(false);
    });
    expect(logger.warn).toHaveBeenCalledTimes(DEPRECATED_RUNTIMES.length);
  });

  test('should list every even major up to and including 20', () => {
    expect(DEPRECATED_RUNTIMES).toEqual([
      'node4',
      'node6',
      'node8',
      'node10',
      'node12',
      'node14',
      'node16',
      'node18',
      'node20',
    ]);
  });

  test('should name the configured runtime in the warning', () => {
    checkForDeprecatedRuntime('node20');
    expect(mocked(logger.warn).mock.calls[0][0]).toContain('node20');
  });

  test('should not warn for currently supported runtimes', () => {
    ['node22', 'node24'].forEach((runtime) => {
      expect(checkForDeprecatedRuntime(runtime)).toEqual(true);
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test('should not warn for runtimes newer than this release knows about', () => {
    // An older toolkit must not claim a future runtime is invalid.
    ['node26', 'node28', 'node30'].forEach((runtime) => {
      expect(checkForDeprecatedRuntime(runtime)).toEqual(true);
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test('should not warn when no runtime is configured', () => {
    expect(checkForDeprecatedRuntime(undefined)).toEqual(true);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test('should leave unrecognised values to the platform', () => {
    expect(checkForDeprecatedRuntime('nope')).toEqual(true);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test('should not exit the process', () => {
    const exit = jest.spyOn(process, 'exit').mockImplementation();
    checkForDeprecatedRuntime('node20');
    expect(exit).not.toHaveBeenCalled();
    exit.mockRestore();
  });
});
