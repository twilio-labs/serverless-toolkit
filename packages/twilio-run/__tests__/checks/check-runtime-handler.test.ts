import { mocked } from 'jest-mock';
import {
  checkForValidRuntimeHandlerVersion,
  isExactSemVerVersion,
} from '../../src/checks/check-runtime-handler';
import { logger } from '../../src/utils/logger';

jest.mock('../../src/utils/logger', () => {
  return {
    logger: {
      error: jest.fn(),
    },
  };
});

describe('isExactSemVerVersion', () => {
  test('should not accept version ranges', () => {
    [
      '>=1.2.7',
      '>=1.2.7 <1.3.0',
      '1.2.7 || >=1.2.9 <2.0.0',
      '<1.3.0',
      '>1.2.3-alpha.3',
      '1.2.3 - 2.3',
      '>=1.2.3 <2.4.0-0',
      '1.x',
      '*',
      '~1.2.3',
      '~1.2',
      '~1.2.3-beta.2',
      '^1.2.3',
      '1.0',
      '1',
      'next',
    ].forEach((version) => {
      expect(isExactSemVerVersion(version)).toEqual(false);
    });
  });

  test('should return true for exact versions', () => {
    ['1.1.0', '1.1.0-rc.1', '1.2.0-alpha.3'].forEach((version) => {
      expect(isExactSemVerVersion(version)).toEqual(true);
    });
  });
});

describe('checkForValidRuntimeHandlerversion', () => {
  test('should by default accept a missing runtime-handler', () => {
    expect(checkForValidRuntimeHandlerVersion({})).toEqual(true);
    expect(checkForValidRuntimeHandlerVersion({ dependencies: {} })).toEqual(
      true
    );
    expect(checkForValidRuntimeHandlerVersion({ devDependencies: {} })).toEqual(
      true
    );
  });

  test('should return false if missing runtime-handler and flag passed', () => {
    expect(checkForValidRuntimeHandlerVersion({}, true)).toEqual(false);
    expect(
      checkForValidRuntimeHandlerVersion({ dependencies: {} }, true)
    ).toEqual(false);
    expect(
      checkForValidRuntimeHandlerVersion({ devDependencies: {} }, true)
    ).toEqual(false);

    expect(mocked(logger.error)).toHaveBeenCalledTimes(3);
    expect(mocked(logger.error).mock.calls[0][1]).toEqual(
      'Missing @twilio/runtime-handler declaration'
    );
  });

  test('should detect if your runtime-handler is defined in devDependencies', () => {
    expect(
      checkForValidRuntimeHandlerVersion({
        devDependencies: { '@twilio/runtime-handler': '1.2.0' },
      })
    ).toEqual(false);

    expect(mocked(logger.error)).toHaveBeenCalledTimes(1);
    expect(mocked(logger.error).mock.calls[0][1]).toEqual(
      'Wrongly configured @twilio/runtime-handler declaration'
    );
  });

  test('should specify the right version if possible', () => {
    expect(
      checkForValidRuntimeHandlerVersion({
        dependencies: { '@twilio/runtime-handler': '~1.2.0' },
      })
    ).toEqual(false);

    expect(mocked(logger.error)).toHaveBeenCalledTimes(1);
    expect(mocked(logger.error).mock.calls[0][1]).toEqual(
      'Invalid @twilio/runtime-handler version'
    );
    expect(mocked(logger.error).mock.calls[0][0].includes('"~1.2.0"')).toEqual(
      true
    );
    expect(mocked(logger.error).mock.calls[0][0].includes('"1.2.0"')).toEqual(
      true
    );
  });

  test('should suggest a fallback when version is invalid', () => {
    expect(
      checkForValidRuntimeHandlerVersion({
        dependencies: { '@twilio/runtime-handler': 'alpha' },
      })
    ).toEqual(false);

    expect(mocked(logger.error)).toHaveBeenCalledTimes(1);
    expect(mocked(logger.error).mock.calls[0][1]).toEqual(
      'Invalid @twilio/runtime-handler version'
    );
    expect(mocked(logger.error).mock.calls[0][0].includes('"alpha"')).toEqual(
      true
    );
    expect(mocked(logger.error).mock.calls[0][0].includes('"1.1.0"')).toEqual(
      true
    );
  });

  test('should pass a valid exact version', () => {
    expect(
      checkForValidRuntimeHandlerVersion({
        dependencies: { '@twilio/runtime-handler': '1.1.0' },
      })
    ).toEqual(true);

    expect(mocked(logger.error)).toHaveBeenCalledTimes(0);
  });
});
