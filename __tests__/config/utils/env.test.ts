import { stripIndent } from 'common-tags';
import mockFs from 'mock-fs';
import path from 'path';
import {
  filterEnvVariablesForDeploy,
  readLocalEnvFile,
} from '../../../src/config/utils/env';
import { EnvironmentVariablesWithAuth } from '../../../src/types/generic';

function normalize(unixPath: string) {
  return path.resolve('/', ...unixPath.split('/'));
}

describe('filterEnvVariablesForDeploy', () => {
  const testVars: EnvironmentVariablesWithAuth = {
    ACCOUNT_SID: 'ACCOUNT_SID',
    AUTH_TOKEN: 'AUTH_TOKEN',
    empty: '',
    hello: 'world',
  };

  it('deletes ACCOUNT_SID and AUTH_TOKEN', () => {
    const deployVars = filterEnvVariablesForDeploy(testVars);
    expect(deployVars['ACCOUNT_SID']).toBeUndefined();
    expect(deployVars['AUTH_TOKEN']).toBeUndefined();
  });

  it('deletes empty env vars', () => {
    const deployVars = filterEnvVariablesForDeploy(testVars);
    expect(deployVars['empty']).toBeUndefined();
  });

  it('leaves other variables as they were', () => {
    const deployVars = filterEnvVariablesForDeploy(testVars);
    expect(deployVars['hello']).toEqual('world');
  });
});

describe('readLocalEnvFile', () => {
  let backupSystemEnv = {};

  const baseFlags = {
    cwd: '/tmp/project',
    env: undefined,
    loadSystemEnv: false,
  };

  beforeEach(() => {
    mockFs({
      '/tmp/project': {
        '.env': stripIndent`
        ACCOUNT_SID=ACxxxxxxx
        AUTH_TOKEN=123456789f
        MY_PHONE_NUMBER=+12345
        SECRET_API_KEY=abc
      `,
        '.env.prod': stripIndent`
        ACCOUNT_SID=
        AUTH_TOKEN=
        MY_PHONE_NUMBER=+3333333
        SECRET_API_KEY=
      `,
      },
      '/tmp/project-two': {
        '.env': stripIndent`
        ACCOUNT_SID=ACyyyyyyy
        AUTH_TOKEN=123456789a
        TWILIO=https://www.twilio.com
      `,
        '.env.prod': stripIndent`
        ACCOUNT_SID=
        AUTH_TOKEN=
        TWILIO=https://www.twilio.com
      `,
      },
    });
    backupSystemEnv = { ...process.env };
  });

  afterEach(() => {
    mockFs.restore();
    process.env = { ...backupSystemEnv };
  });

  it('should throw an error if you use --load-system-env without --env', async () => {
    const errorMessage = stripIndent`
      If you are using --load-system-env you'll also have to supply a --env flag.
      
      The .env file you are pointing at will be used to primarily load environment variables.
      Any empty entries in the .env file will fall back to the system's environment variables.
    `;

    expect(
      readLocalEnvFile({ ...baseFlags, loadSystemEnv: true })
    ).rejects.toEqual(new Error(errorMessage));
  });

  it('should load the default env variables', async () => {
    expect(await readLocalEnvFile(baseFlags)).toEqual({
      localEnv: {
        ACCOUNT_SID: 'ACxxxxxxx',
        AUTH_TOKEN: '123456789f',
        MY_PHONE_NUMBER: '+12345',
        SECRET_API_KEY: 'abc',
      },
      envPath: normalize('/tmp/project/.env'),
    });
  });

  it('should load env variables from a different filename', async () => {
    expect(await readLocalEnvFile({ ...baseFlags, env: '.env.prod' })).toEqual({
      localEnv: {
        ACCOUNT_SID: '',
        AUTH_TOKEN: '',
        MY_PHONE_NUMBER: '+3333333',
        SECRET_API_KEY: '',
      },
      envPath: normalize('/tmp/project/.env.prod'),
    });
  });

  it('should load the default env variables with different cwd', async () => {
    expect(
      await readLocalEnvFile({ ...baseFlags, cwd: '/tmp/project-two' })
    ).toEqual({
      localEnv: {
        ACCOUNT_SID: 'ACyyyyyyy',
        AUTH_TOKEN: '123456789a',
        TWILIO: 'https://www.twilio.com',
      },
      envPath: normalize('/tmp/project-two/.env'),
    });
  });

  it('should load env variables from a different filename & cwd', async () => {
    expect(
      await readLocalEnvFile({
        ...baseFlags,
        cwd: '/tmp/project-two',
        env: '.env.prod',
      })
    ).toEqual({
      localEnv: {
        ACCOUNT_SID: '',
        AUTH_TOKEN: '',
        TWILIO: 'https://www.twilio.com',
      },
      envPath: normalize('/tmp/project-two/.env.prod'),
    });
  });

  it('should fallback to system env variables for empty variables with loadSystemEnv', async () => {
    process.env = {
      TWILIO: 'https://www.twilio.com/blog',
      ACCOUNT_SID: 'ACzzzzzzz',
      SECRET_API_KEY: 'psst',
    };

    expect(
      await readLocalEnvFile({
        ...baseFlags,
        env: '.env.prod',
        loadSystemEnv: true,
      })
    ).toEqual({
      localEnv: {
        ACCOUNT_SID: 'ACzzzzzzz',
        AUTH_TOKEN: '',
        MY_PHONE_NUMBER: '+3333333',
        SECRET_API_KEY: 'psst',
      },
      envPath: normalize('/tmp/project/.env.prod'),
    });
  });
});
