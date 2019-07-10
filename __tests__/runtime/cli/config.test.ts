import {
  getBaseDirectory,
  getInspectInfo,
  getPort,
  getUrl,
  WrappedStartCliFlags,
} from '../../../src/runtime/cli/config';

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
    const config = ({
      flags: {
        ngrok: undefined,
      },
    } as unknown) as WrappedStartCliFlags;

    const url = await getUrl(config, 3000);
    expect(url).toBe('http://localhost:3000');
  });

  test('calls ngrok if ngrok is defined', async () => {
    const config = ({
      flags: {
        ngrok: '',
      },
    } as unknown) as WrappedStartCliFlags;

    const url = await getUrl(config, 3000);
    expect(url).toBe('https://random.ngrok.io');
  });

  test('calls ngrok with custom subdomain if passed', async () => {
    const config = ({
      flags: {
        ngrok: 'dom',
      },
    } as unknown) as WrappedStartCliFlags;

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
    const config = ({
      flags: {
        port: undefined,
      },
    } as unknown) as WrappedStartCliFlags;

    delete process.env.PORT;
    const port = getPort(config);
    expect(port).toBe(3000);
  });

  test('checks for process.env.PORT and returns number', () => {
    const config = ({
      flags: {
        port: undefined,
      },
    } as unknown) as WrappedStartCliFlags;

    process.env.PORT = '9999';
    const port = getPort(config);
    expect(typeof port).toBe('number');
    expect(port).toBe(9999);
  });

  test('port passed via flag takes preference', () => {
    const config = ({
      flags: {
        port: 1234,
      },
    } as unknown) as WrappedStartCliFlags;

    process.env.PORT = '9999';
    const port = getPort(config);
    expect(typeof port).toBe('number');
    expect(port).toBe(1234);
  });

  test('handles strings and returns number', () => {
    const config = ({
      flags: {
        port: '8080',
      },
    } as unknown) as WrappedStartCliFlags;

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
    process.chdir('/private/tmp');
  });

  afterAll(() => {
    process.chdir(initialWorkingDirectory);
  });

  test('handles current working directory if none is passed', () => {
    const config = ({
      flags: {
        dir: undefined,
        cwd: undefined,
      },
    } as unknown) as WrappedStartCliFlags;

    const result = getBaseDirectory(config);
    expect(result).toBe('/private/tmp');
  });

  test('supports dir argument', () => {
    const config = ({
      flags: {
        dir: '/usr/local',
        cwd: undefined,
      },
    } as unknown) as WrappedStartCliFlags;

    const result = getBaseDirectory(config);
    expect(result).toBe('/usr/local');
  });

  test('prefers cwd over dir argument', () => {
    const config = ({
      flags: {
        dir: '/usr/local',
        cwd: '/usr/bin',
      },
    } as unknown) as WrappedStartCliFlags;

    const result = getBaseDirectory(config);
    expect(result).toBe('/usr/bin');
  });

  test('handles relative path for dir', () => {
    let config = ({
      flags: {
        dir: 'demo',
        cwd: undefined,
      },
    } as unknown) as WrappedStartCliFlags;

    let result = getBaseDirectory(config);
    expect(result).toBe('/private/tmp/demo');

    config = ({
      flags: {
        dir: '../demo',
        cwd: undefined,
      },
    } as unknown) as WrappedStartCliFlags;

    result = getBaseDirectory(config);
    expect(result).toBe('/private/demo');
  });

  test('handles relative path for cwd', () => {
    let config = ({
      flags: {
        dir: undefined,
        cwd: 'demo',
      },
    } as unknown) as WrappedStartCliFlags;

    let result = getBaseDirectory(config);
    expect(result).toBe('/private/tmp/demo');

    config = ({
      flags: {
        dir: undefined,
        cwd: '../demo',
      },
    } as unknown) as WrappedStartCliFlags;

    result = getBaseDirectory(config);
    expect(result).toBe('/private/demo');
  });
});

describe('getInspectInfo', () => {
  test('returns undefined if nothing is passed', () => {
    const config = ({
      flags: {
        inspect: undefined,
        inspectBrk: undefined,
      },
    } as unknown) as WrappedStartCliFlags;

    const result = getInspectInfo(config);
    expect(result).toBeUndefined();
  });

  test('handles present but empty inspect flag', () => {
    const config = ({
      flags: {
        inspect: '',
        inspectBrk: undefined,
      },
    } as unknown) as WrappedStartCliFlags;

    const result = getInspectInfo(config);
    expect(result).toEqual({ hostPort: '', break: false });
  });

  test('handles present but empty inspectBrk flag', () => {
    const config = ({
      flags: {
        inspect: undefined,
        inspectBrk: '',
      },
    } as unknown) as WrappedStartCliFlags;

    const result = getInspectInfo(config);
    expect(result).toEqual({ hostPort: '', break: true });
  });

  test('handles passed port in inspect flag', () => {
    const config = ({
      flags: {
        inspect: '9999',
        inspectBrk: undefined,
      },
    } as unknown) as WrappedStartCliFlags;

    const result = getInspectInfo(config);
    expect(result).toEqual({ hostPort: '9999', break: false });
  });

  test('handles passed port in inspect flag', () => {
    const config = ({
      flags: {
        inspect: undefined,
        inspectBrk: '1234',
      },
    } as unknown) as WrappedStartCliFlags;

    const result = getInspectInfo(config);
    expect(result).toEqual({ hostPort: '1234', break: true });
  });
});

describe('getConfigFromCli', () => {
  test('TODO', () => {
    expect(true).toBeTruthy();
  });
});
