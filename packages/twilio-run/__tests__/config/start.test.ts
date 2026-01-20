jest.mock('../../src/config/utils/package-json');

import {
  getBaseDirectory,
  getConfigFromCli,
  getInspectInfo,
  getNgrokAuthToken,
  getPort,
  getUrl,
  StartCliConfig,
  StartCliFlags,
  __resetNgrokState,
} from '../../src/config/start';

import os from 'os';
import path from 'path';

jest.mock(
  '@ngrok/ngrok',
  () => {
    return {
      forward: jest
        .fn()
        .mockImplementation(
          ({ addr, domain }: { addr: number | string; domain?: string }) => {
            const urlString = domain
              ? `https://${domain}`
              : 'https://random.ngrok.io';

            return Promise.resolve({
              url: () => urlString,
              close: jest.fn().mockResolvedValue(undefined),
            });
          }
        ),
    };
  },
  { virtual: true }
);

describe('getUrl', () => {
  let existsSpy: jest.SpyInstance;
  let readFileSpy: jest.SpyInstance;

  beforeEach(() => {
    __resetNgrokState();

    // Prevent reading real ngrok config files
    const fs = require('fs');
    existsSpy = jest.spyOn(fs, 'existsSync');
    existsSpy.mockReturnValue(false);
    readFileSpy = jest.spyOn(fs, 'readFileSync');
  });

  afterEach(() => {
    __resetNgrokState();
    existsSpy.mockRestore();
    readFileSpy.mockRestore();
  });

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

  test('handles ENOEXEC error with helpful message', async () => {
    const ngrok = require('@ngrok/ngrok');
    const originalForward = ngrok.forward;

    // Mock ngrok to throw ENOEXEC error
    ngrok.forward = jest.fn().mockRejectedValue({
      code: 'ENOEXEC',
      errno: -88,
      message: 'spawn ngrok ENOEXEC',
    });

    const config = { ngrok: '' } as unknown as StartCliFlags;

    await expect(getUrl(config, 3000)).rejects.toThrow(/ngrok failed to start/);

    // Restore original mock
    ngrok.forward = originalForward;
  });

  test('handles generic ngrok errors with helpful message', async () => {
    const ngrok = require('@ngrok/ngrok');
    const originalForward = ngrok.forward;

    // Mock ngrok to throw a generic error
    ngrok.forward = jest.fn().mockRejectedValue({
      message: 'Connection refused',
    });

    const config = { ngrok: '' } as unknown as StartCliFlags;

    await expect(getUrl(config, 3000)).rejects.toThrow(
      /ngrok failed to start: Connection refused/
    );

    // Restore original mock
    ngrok.forward = originalForward;
  });

  test('converts subdomain to full domain format', async () => {
    // Use shared existsSpy from beforeEach (already mocked to return false)
    const ngrok = require('@ngrok/ngrok');

    const config = { ngrok: 'mysubdomain' } as unknown as StartCliFlags;
    await getUrl(config, 3000);

    expect(ngrok.forward).toHaveBeenCalledWith({
      addr: 3000,
      domain: 'mysubdomain.ngrok.io',
    });
    // No manual spy creation or restoration
  });

  test('preserves full domain if provided', async () => {
    // Use shared existsSpy from beforeEach (already mocked to return false)
    const ngrok = require('@ngrok/ngrok');

    const config = { ngrok: 'custom.ngrok.io' } as unknown as StartCliFlags;
    await getUrl(config, 3000);

    expect(ngrok.forward).toHaveBeenCalledWith({
      addr: 3000,
      domain: 'custom.ngrok.io',
    });
    // No manual spy creation or restoration
  });

  test('converts non-ngrok domains to ngrok.io format', async () => {
    // Use shared existsSpy from beforeEach (already mocked to return false)
    const ngrok = require('@ngrok/ngrok');

    const config = { ngrok: 'my.app' } as unknown as StartCliFlags;
    await getUrl(config, 3000);

    expect(ngrok.forward).toHaveBeenCalledWith({
      addr: 3000,
      domain: 'my.app.ngrok.io',
    });
    // No manual spy creation or restoration
  });

  test('preserves ngrok.dev domain if provided', async () => {
    // Use shared existsSpy from beforeEach (already mocked to return false)
    const ngrok = require('@ngrok/ngrok');
    const config = { ngrok: 'custom.ngrok.dev' } as unknown as StartCliFlags;
    await getUrl(config, 3000);

    expect(ngrok.forward).toHaveBeenCalledWith({
      addr: 3000,
      domain: 'custom.ngrok.dev',
    });
    // No manual spy creation or restoration
  });

  test('preserves ngrok-free.app domain if provided', async () => {
    // Use shared existsSpy from beforeEach (already mocked to return false)
    const ngrok = require('@ngrok/ngrok');
    const config = { ngrok: 'test.ngrok-free.app' } as unknown as StartCliFlags;
    await getUrl(config, 3000);

    expect(ngrok.forward).toHaveBeenCalledWith({
      addr: 3000,
      domain: 'test.ngrok-free.app',
    });
    // No manual spy creation or restoration
  });

  test('appends .ngrok.io to domains that do not match ngrok TLDs', async () => {
    // Use shared existsSpy from beforeEach (already mocked to return false)
    const ngrok = require('@ngrok/ngrok');
    const config = { ngrok: 'company.ngrokit.com' } as unknown as StartCliFlags;
    await getUrl(config, 3000);

    expect(ngrok.forward).toHaveBeenCalledWith({
      addr: 3000,
      domain: 'company.ngrokit.com.ngrok.io',
    });
    // No manual spy creation or restoration
  });

  test('handles listener without URL', async () => {
    const ngrok = require('@ngrok/ngrok');
    const originalForward = ngrok.forward;

    ngrok.forward = jest.fn().mockResolvedValue({
      url: () => undefined,
      close: jest.fn(),
    });

    const config = { ngrok: '' } as unknown as StartCliFlags;

    await expect(getUrl(config, 3000)).rejects.toThrow(/no URL was returned/);

    // Restore original mock
    ngrok.forward = originalForward;
  });

  test('passes authtoken to ngrok.forward() when found in config', async () => {
    // Use shared spies from beforeEach
    existsSpy.mockReturnValueOnce(true);
    readFileSpy.mockReturnValueOnce('authtoken: test-token-12345\nregion: us');

    const ngrok = require('@ngrok/ngrok');
    const config = { ngrok: 'myapp' } as unknown as StartCliFlags;

    await getUrl(config, 3000);

    expect(ngrok.forward).toHaveBeenCalledWith({
      addr: 3000,
      domain: 'myapp.ngrok.io',
      authtoken: 'test-token-12345',
    });
    // No manual spy creation or restoration
  });

  test('closes existing tunnel before creating new one', async () => {
    const config = {
      ngrok: 'test-app',
    } as unknown as StartCliFlags;

    const ngrok = require('@ngrok/ngrok');

    // First call
    const url1 = await getUrl(config, 3000);
    expect(url1).toBe('https://test-app.ngrok.io');

    // Get reference to first listener
    const firstListener = await ngrok.forward.mock.results[0].value;
    const firstClose = firstListener.close;

    // Second call
    const url2 = await getUrl(config, 3000);
    expect(url2).toBe('https://test-app.ngrok.io');

    // Verify first listener's close was called
    expect(firstClose).toHaveBeenCalled();

    // Verify forward was called twice
    expect(ngrok.forward).toHaveBeenCalledTimes(2);
  });

  test('does not read real ngrok config during tests', async () => {
    // Use shared spies from beforeEach
    const config = { ngrok: 'test' } as unknown as StartCliFlags;
    await getUrl(config, 3000);

    // Verify existsSync was called (from beforeEach mock) but returned false
    expect(existsSpy).toHaveBeenCalled();
    // Verify readFileSync was NOT called (because exists returned false)
    expect(readFileSpy).not.toHaveBeenCalled();
    // No manual spy creation or restoration
  });

  test('validation error has correct message without connection context', async () => {
    const ngrok = require('@ngrok/ngrok');
    const originalForward = ngrok.forward;

    // Mock ngrok to return listener without URL
    ngrok.forward = jest.fn().mockResolvedValue({
      url: () => undefined, // No URL returned
      close: jest.fn(),
    });

    const config = { ngrok: '' } as unknown as StartCliFlags;

    // Verify error message contains internal error text
    await expect(getUrl(config, 3000)).rejects.toThrow(
      /unexpected internal error/
    );
    await expect(getUrl(config, 3000)).rejects.toThrow(
      /Please report this issue/
    );

    // Verify error message does NOT contain connection-related text
    try {
      await getUrl(config, 3000);
      fail('Expected getUrl to throw an error');
    } catch (error: any) {
      expect(error.message).not.toContain('Check your ngrok configuration');
      expect(error.message).not.toContain('network connectivity');
    }

    ngrok.forward = originalForward;
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

describe('getNgrokAuthToken', () => {
  let existsSyncSpy: jest.SpyInstance;
  let readFileSyncSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock fs module functions
    const fs = require('fs');
    existsSyncSpy = jest.spyOn(fs, 'existsSync');
    readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
  });

  afterEach(() => {
    existsSyncSpy.mockRestore();
    readFileSyncSpy.mockRestore();
  });

  test('returns undefined when no config files exist', () => {
    existsSyncSpy.mockReturnValue(false);

    const token = getNgrokAuthToken();

    expect(token).toBeUndefined();
    expect(existsSyncSpy).toHaveBeenCalled();
    expect(readFileSyncSpy).not.toHaveBeenCalled();
  });

  test('reads authtoken from ~/.ngrok2/ngrok.yml', () => {
    const expectedToken = 'test-token-12345';
    const configContent = `authtoken: ${expectedToken}\nregion: us`;

    existsSyncSpy.mockImplementation((path: string) => {
      return path.includes('.ngrok2');
    });
    readFileSyncSpy.mockReturnValue(configContent);

    const token = getNgrokAuthToken();

    expect(token).toBe(expectedToken);
    expect(readFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining('.ngrok2'),
      'utf8'
    );
  });

  test('reads authtoken from ~/Library/Application Support/ngrok/ngrok.yml', () => {
    const expectedToken = 'test-token-67890';
    const configContent = `region: us\nauthtoken: ${expectedToken}`;

    existsSyncSpy.mockImplementation((path: string) => {
      return path.includes('Application Support');
    });
    readFileSyncSpy.mockReturnValue(configContent);

    const token = getNgrokAuthToken();

    expect(token).toBe(expectedToken);
    expect(readFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining('Application Support'),
      'utf8'
    );
  });

  test('reads authtoken from Windows AppData path', () => {
    const expectedToken = 'test-token-windows';
    const configContent = `authtoken: ${expectedToken}\nregion: eu`;

    existsSyncSpy.mockImplementation((path: string) => {
      return path.includes('AppData');
    });
    readFileSyncSpy.mockReturnValue(configContent);

    const token = getNgrokAuthToken();

    expect(token).toBe(expectedToken);
    expect(readFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining('AppData'),
      'utf8'
    );
  });

  test('returns undefined when config file exists but has no authtoken', () => {
    const configContent = `region: us\nversion: 2`;

    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockReturnValue(configContent);

    const token = getNgrokAuthToken();

    expect(token).toBeUndefined();
  });

  test('trims whitespace around authtoken', () => {
    const expectedToken = 'test-token-with-spaces';
    const configContent = `authtoken:    ${expectedToken}   \n`;

    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockReturnValue(configContent);

    const token = getNgrokAuthToken();

    expect(token).toBe(expectedToken);
  });

  test('extracts authtoken without inline comments', () => {
    const expectedToken = 'test-token-12345';
    const configContent = `authtoken: ${expectedToken} # this is my token\nregion: us`;

    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockReturnValue(configContent);

    const token = getNgrokAuthToken();

    expect(token).toBe(expectedToken);
  });

  test('returns undefined when file read throws error', () => {
    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockImplementation(() => {
      throw new Error('Permission denied');
    });

    const token = getNgrokAuthToken();

    expect(token).toBeUndefined();
  });

  test('tries second path when first does not exist', () => {
    const expectedToken = 'test-token-second-path';
    const configContent = `authtoken: ${expectedToken}`;

    let callCount = 0;
    existsSyncSpy.mockImplementation(() => {
      callCount++;
      return callCount === 2; // Only second path exists
    });
    readFileSyncSpy.mockReturnValue(configContent);

    const token = getNgrokAuthToken();

    expect(token).toBe(expectedToken);
    expect(existsSyncSpy).toHaveBeenCalledTimes(2);
  });
});

describe('ngrok cleanup handlers', () => {
  let processOnceSpy: jest.SpyInstance;
  let existsSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset module state before each test
    __resetNgrokState();
    processOnceSpy = jest.spyOn(process, 'once');

    // Prevent reading real ngrok config files
    const fs = require('fs');
    existsSpy = jest.spyOn(fs, 'existsSync');
    existsSpy.mockReturnValue(false);
  });

  afterEach(() => {
    processOnceSpy.mockRestore();
    existsSpy.mockRestore();
  });

  test('registers SIGINT and SIGTERM handlers', async () => {
    const config = {
      ngrok: 'test-app',
    } as unknown as StartCliFlags;

    await getUrl(config, 3000);

    expect(processOnceSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(processOnceSpy).toHaveBeenCalledWith(
      'SIGTERM',
      expect.any(Function)
    );
  });

  test('re-registers handlers for sequential tunnels', async () => {
    const config = {
      ngrok: 'test-app',
    } as unknown as StartCliFlags;

    await getUrl(config, 3000);
    await getUrl(config, 3000);

    // Handlers are removed and re-registered for each tunnel (4 total: 2 per getUrl call)
    expect(processOnceSpy).toHaveBeenCalledTimes(4);
  });

  test('cleanup handler calls listener.close()', async () => {
    const config = {
      ngrok: 'test-app',
    } as unknown as StartCliFlags;

    await getUrl(config, 3000);

    const ngrok = require('@ngrok/ngrok');
    const listener = await ngrok.forward.mock.results[0].value;

    // Get the SIGINT handler that was registered
    const sigintHandler = processOnceSpy.mock.calls.find(
      (call) => call[0] === 'SIGINT'
    )?.[1];

    expect(sigintHandler).toBeDefined();

    // Mock process.exit to prevent test from exiting
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation();

    // Call the handler
    await sigintHandler();

    // Verify close was called
    expect(listener.close).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
  });

  test('cleanup handler handles errors during close gracefully', async () => {
    const config = {
      ngrok: 'test-app',
    } as unknown as StartCliFlags;

    await getUrl(config, 3000);

    const ngrok = require('@ngrok/ngrok');
    const listener = await ngrok.forward.mock.results[0].value;

    // Make listener.close() throw an error
    listener.close.mockRejectedValue(new Error('Failed to close tunnel'));

    // Get the SIGINT handler that was registered
    const sigintHandler = processOnceSpy.mock.calls.find(
      (call) => call[0] === 'SIGINT'
    )?.[1];

    expect(sigintHandler).toBeDefined();

    // Mock process.exit to prevent test from exiting
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation();

    // Call the handler - should not throw despite close() error
    await sigintHandler();

    // Verify close was attempted
    expect(listener.close).toHaveBeenCalled();

    // Verify process.exit is still called even after error
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
  });

  test('__resetNgrokState removes signal handlers', async () => {
    const config = {
      ngrok: 'test-app',
    } as unknown as StartCliFlags;

    await getUrl(config, 3000);

    // Verify handlers are registered
    expect(processOnceSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(processOnceSpy).toHaveBeenCalledWith(
      'SIGTERM',
      expect.any(Function)
    );

    // Spy on process.off (modern API)
    const processOffSpy = jest.spyOn(process, 'off');

    // Reset state
    __resetNgrokState();

    // Verify handlers were removed
    expect(processOffSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(processOffSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));

    processOffSpy.mockRestore();
  });
});
