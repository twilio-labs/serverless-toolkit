import path from 'path';
import { mocked } from 'jest-mock';
import checkLegacyConfig, {
  printConfigWarning,
} from '../../src/checks/legacy-config';
import { fileExistsSync } from '../../src/utils/fs';
import { logger } from '../../src/utils/logger';

jest.mock('inquirer', () => {
  return {
    prompt: jest.fn(() => Promise.resolve({ continue: USER_CONTINUES })),
  };
});

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
var USER_CONTINUES = true;

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
  it('should print a warning if the config file exists', async () => {
    SHOULD_FILE_EXIST = true;
    const result = await checkLegacyConfig();
    expect(result).toBe(true);
    expect(logger.warn).toHaveBeenCalled();
  });

  it('should not print a warning if the file does not exist', async () => {
    SHOULD_FILE_EXIST = false;
    const result = await checkLegacyConfig();
    expect(result).toBe(true);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should use default path to look for file', async () => {
    SHOULD_FILE_EXIST = true;
    const result = await checkLegacyConfig();
    expect(result).toBe(true);
    expect(mocked(fileExistsSync)).toHaveBeenCalledWith(
      path.resolve(process.cwd(), '.twilio-functions')
    );
  });

  it('should override directory to look for file', async () => {
    SHOULD_FILE_EXIST = true;
    const result = await checkLegacyConfig('/tmp');
    expect(result).toBe(true);
    expect(mocked(fileExistsSync)).toHaveBeenCalledWith(
      path.resolve('/tmp', '.twilio-functions')
    );
  });

  it('should prompt the user by default and return result', async () => {
    USER_CONTINUES = false;
    const result = await checkLegacyConfig('/tmp');
    expect(mocked(fileExistsSync)).toHaveBeenCalledWith(
      path.resolve('/tmp', '.twilio-functions')
    );
    expect(result).toBe(false);
  });

  it('should prompt the user with specified option and return result', async () => {
    USER_CONTINUES = true;
    const result = await checkLegacyConfig('/tmp', true);
    expect(mocked(fileExistsSync)).toHaveBeenCalledWith(
      path.resolve('/tmp', '.twilio-functions')
    );
    expect(result).toBe(true);
  });

  it('should return true if not prompted', async () => {
    const result = await checkLegacyConfig('/tmp', false);
    expect(mocked(fileExistsSync)).toHaveBeenCalledWith(
      path.resolve('/tmp', '.twilio-functions')
    );
    expect(result).toBe(true);
  });
});
