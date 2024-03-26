jest.mock('../../src/config/utils/package-json');

import {
  getBaseDirectory,
  getConfigFromCli,
  getInspectInfo,
  getPort,
  getUrl,
  StartCliConfig,
  StartCliFlags,
} from '../../src/config/start';

import os from 'os';
import path from 'path';

jest.mock('ngrok', () => {
  return {
    connect: jest
      .fn()
      .mockImplementation(
        ({ addr, subdomain }: { addr: number | string; subdomain: string }) =>
          Promise.resolve(`https://${subdomain || 'random'}.ngrok.io`)
      ),
  };
});

describe('getUrl', () => {
  test('returns localhost if ngrok is not passed', async () => {
    const config = {
      ngrok: undefined,
    } as unknown as StartCliFlags;

    const url = await getUrl(config, 3000);
    expect(url).toBe('http://localhost:3000');
  });

  test('calls ngrok if ngrok is defined', async () => {
    const config = {
      ngrok: '',
    } as unknown as StartCliFlags;

    const url = await getUrl(config, 3000);
    expect(url).toBe('https://random.ngrok.io');
  });

  test('calls ngrok with custom subdomain if passed', async () => {
    const config = {
      ngrok: 'dom',
    } as unknown as StartCliFlags;

    const url = await getUrl(config, 3000);
    expect(url).toBe('https://dom.ngrok.io');
  });
});

describe('getPort', () => {
  let backupPort: string | undefined;

  beforeEach(() => {
    backupPort = process.env.PORT;
  });

  afterEach(() => {
    if (backupPort) {
      process.env.PORT = backupPort;
    } else {
      delete process.env.PORT;
    }
  });

  test('returns default 3000 if nothing is passed', () => {
    const config = {
      port: undefined,
    } as unknown as StartCliFlags;

    delete process.env.PORT;
    const port = getPort(config);
    expect(port).toBe(3000);
  });

  test('checks for process.env.PORT and returns number', () => {
    const config = {
      port: undefined,
    } as unknown as StartCliFlags;

    process.env.PORT = '9999';
    const port = getPort(config);
    expect(typeof port).toBe('number');
    expect(port).toBe(9999);
  });

  test('port passed via flag takes preference', () => {
    const config = {
      port: 1234,
    } as unknown as StartCliFlags;

    process.env.PORT = '9999';
    const port = getPort(config);
    expect(typeof port).toBe('number');
    expect(port).toBe(1234);
  });

  test('handles strings and returns number', () => {
    const config = {
      port: '8080',
    } as unknown as StartCliFlags;

    process.env.PORT = '9999';
    const port = getPort(config);
    expect(typeof port).toBe('number');
    expect(port).toBe(8080);
  });
});

describe('getEnvironment', () => {
  test('TODO', () => {
    expect(true).toBe(true);
  });
});

describe('getBaseDirectory', () => {
  const initialWorkingDirectory = process.cwd();

  beforeAll(() => {
    process.chdir(os.homedir());
  });

  afterAll(() => {
    process.chdir(initialWorkingDirectory);
  });

  test('handles current working directory if none is passed', () => {
    const config = {
      dir: undefined,
      cwd: undefined,
    } as unknown as StartCliFlags;

    const result = getBaseDirectory(config);
    expect(result).toBe(os.homedir());
  });

  test('supports dir argument', () => {
    const config = {
      dir: '/usr/local',
      cwd: undefined,
    } as unknown as StartCliFlags;

    const result = getBaseDirectory(config);
    expect(result).toBe(path.resolve('/usr/local'));
  });

  test('prefers cwd over dir argument', () => {
    const config = {
      dir: '/usr/local',
      cwd: '/usr/bin',
    } as unknown as StartCliFlags;

    const result = getBaseDirectory(config);
    expect(result).toBe(path.resolve('/usr/bin'));
  });

  test('handles relative path for dir', () => {
    let config = {
      dir: 'demo',
      cwd: undefined,
    } as unknown as StartCliFlags;

    let result = getBaseDirectory(config);
    expect(result).toBe(path.resolve('demo'));

    config = {
      dir: '../demo',
      cwd: undefined,
    } as unknown as StartCliFlags;

    result = getBaseDirectory(config);
    expect(result).toBe(path.resolve('../demo'));
  });

  test('handles relative path for cwd', () => {
    let config = {
      dir: undefined,
      cwd: 'demo',
    } as unknown as StartCliFlags;

    let result = getBaseDirectory(config);
    expect(result).toBe(path.resolve('demo'));

    config = {
      dir: undefined,
      cwd: '../demo',
    } as unknown as StartCliFlags;

    result = getBaseDirectory(config);
    expect(result).toBe(path.resolve('../demo'));
  });
});

describe('getInspectInfo', () => {
  test('returns undefined if nothing is passed', () => {
    const config = {
      inspect: undefined,
      inspectBrk: undefined,
    } as unknown as StartCliFlags;

    const result = getInspectInfo(config);
    expect(result).toBeUndefined();
  });

  test('handles present but empty inspect flag', () => {
    const config = {
      inspect: '',
      inspectBrk: undefined,
    } as unknown as StartCliFlags;

    const result = getInspectInfo(config);
    expect(result).toEqual({ hostPort: '', break: false });
  });

  test('handles present but empty inspectBrk flag', () => {
    const config = {
      inspect: undefined,
      inspectBrk: '',
    } as unknown as StartCliFlags;

    const result = getInspectInfo(config);
    expect(result).toEqual({ hostPort: '', break: true });
  });

  test('handles passed port in inspect flag', () => {
    const config = {
      inspect: '9999',
      inspectBrk: undefined,
    } as unknown as StartCliFlags;

    const result = getInspectInfo(config);
    expect(result).toEqual({ hostPort: '9999', break: false });
  });

  test('handles passed port in inspect flag', () => {
    const config = {
      inspect: undefined,
      inspectBrk: '1234',
    } as unknown as StartCliFlags;

    const result = getInspectInfo(config);
    expect(result).toEqual({ hostPort: '1234', break: true });
  });
});

describe('getConfigFromCli', () => {
  const initialWorkingDirectory = process.cwd();

  beforeAll(() => {
    process.chdir(os.homedir());
  });

  afterAll(() => {
    process.chdir(initialWorkingDirectory);
  });

  beforeEach(() => {
    require('../../src/config/utils/package-json').__setPackageJson({});
  });

  test('uses passed in directory as base directory', async () => {
    require('../../src/config/utils/package-json').__setPackageJson({});
    const config = {
      dir: './other_dir',
    } as unknown as StartCliFlags;
    if (config.dir) {
      const startConfig = await getConfigFromCli(config);
      expect(startConfig.baseDir).toEqual(path.resolve(config.dir));
    }
  });

  test('uses passed in cwd as base directory', async () => {
    require('../../src/config/utils/package-json').__setPackageJson({});
    const config = {
      dir: './other_dir',
      cwd: './new_cwd',
    } as unknown as StartCliFlags;
    if (config.cwd) {
      const startConfig = await getConfigFromCli(config);
      expect(startConfig.baseDir).toEqual(path.resolve(config.cwd));
    }
  });

  test('turns off fork process if inspect is enabled', async () => {
    require('../../src/config/utils/package-json').__setPackageJson({});
    const config = {
      dir: './other_dir',
      inspect: '',
    } as unknown as StartCliFlags;
    if (config.dir) {
      const startConfig = await getConfigFromCli(config);
      expect(startConfig.baseDir).toEqual(path.resolve(config.dir));
      expect(startConfig.forkProcess).toEqual(false);
      expect(startConfig.inspect).not.toEqual(undefined);
    }
  });
});
