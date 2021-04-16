import { mocked } from 'ts-jest/utils';
import checkLegacyConfig, {
  printConfigWarning,
} from '../../src/checks/legacy-config';
import { logger } from '../../src/utils/logger';

jest.mock('../../src/utils/fs', () => ({
  fileExistsSync: jest.fn(() => {
    return SHOULD_FILE_EXIST;
  }),
}));

jest.mock('../../src/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
  },
}));

var SHOULD_FILE_EXIST = false;

describe('printLegacyConfig', () => {
  it('should log a message with the correct title', () => {
    printConfigWarning();
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(
      mocked(logger.warn).mock.calls[0][0].includes(
        'We found a .twilio-functions file'
      )
    ).toBeTruthy();
    expect(mocked(logger.warn).mock.calls[0][1]).toEqual(
      'Legacy Configuration Detected'
    );
  });
});

describe('checkLegacyConfig', () => {
  it('should print a warning if the config file exists', () => {
    SHOULD_FILE_EXIST = true;
    checkLegacyConfig();
    expect(logger.warn).toHaveBeenCalled();
  });

  it('should not print a warning if the file does not exist', () => {
    SHOULD_FILE_EXIST = false;
    checkLegacyConfig();
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
