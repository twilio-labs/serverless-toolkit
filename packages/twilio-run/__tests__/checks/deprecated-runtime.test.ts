import { mocked } from 'jest-mock';
import { checkForDeprecatedRuntime } from '../../src/checks/deprecated-runtime';
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

  test('should not warn for supported runtimes', () => {
    ['node22', 'node24'].forEach((runtime) => {
      expect(checkForDeprecatedRuntime(runtime)).toEqual(true);
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test('should not warn when no runtime is configured', () => {
    expect(checkForDeprecatedRuntime(undefined)).toEqual(true);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test('should warn for deprecated runtimes', () => {
    expect(checkForDeprecatedRuntime('node20')).toEqual(false);
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(mocked(logger.warn).mock.calls[0][0]).toContain('node20');
  });

  test('should warn for unknown runtime values', () => {
    expect(checkForDeprecatedRuntime('node18')).toEqual(false);
    expect(checkForDeprecatedRuntime('nope')).toEqual(false);
    expect(logger.warn).toHaveBeenCalledTimes(2);
  });

  test('should not exit the process', () => {
    const exit = jest.spyOn(process, 'exit').mockImplementation();
    checkForDeprecatedRuntime('node20');
    expect(exit).not.toHaveBeenCalled();
    exit.mockRestore();
  });
});
