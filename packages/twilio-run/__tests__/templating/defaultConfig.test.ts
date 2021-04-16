let _shouldFileExist = false;
const writeFile = jest.fn().mockImplementation(async () => {});
const fileExists = jest.fn().mockImplementation(async () => _shouldFileExist);

jest.mock('../../src/utils/fs', () => {
  return {
    writeFile,
    fileExists,
  };
});

import { writeDefaultConfigFile } from '../../src/templating/defaultConfig';

describe('writeDefaultConfigFile', () => {
  test('should write default file if none exists', async () => {
    _shouldFileExist = false;
    const wroteFile = await writeDefaultConfigFile('/tmp/');
    expect(wroteFile).toEqual(true);
    expect(writeFile).toHaveBeenCalled();
  });

  test('default file should match snapshot', async () => {
    _shouldFileExist = false;
    const wroteFile = await writeDefaultConfigFile('/tmp/');
    expect(wroteFile).toEqual(true);
    expect(
      writeFile.mock.calls[writeFile.mock.calls.length - 1][1]
    ).toMatchSnapshot();
  });

  test('should not write false file if one exists', async () => {
    _shouldFileExist = true;
    const wroteFile = await writeDefaultConfigFile('/tmp/');
    expect(wroteFile).toEqual(false);
    expect(writeFile).not.toHaveBeenCalled();
  });

  test('should handle if the default file could not be written', async () => {
    _shouldFileExist = false;
    writeFile.mockImplementationOnce(() => {
      throw new Error('Expected error');
    });
    const wroteFile = await writeDefaultConfigFile('/tmp/');
    expect(wroteFile).toEqual(false);
    expect(writeFile).toHaveBeenCalled();
  });
});
