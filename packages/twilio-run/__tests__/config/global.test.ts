jest.mock('../../src/config/utils/configLoader');

import { readSpecializedConfig } from '../../src/config/global';
import { ConfigurationFile } from '../../src/types/config';
const {
  __setTestConfig,
}: {
  __setTestConfig: (config: Partial<ConfigurationFile>) => void;
} = require('../../src/config/utils/configLoader');

describe('readSpecializedConfig', () => {
  test('returns the right base config', () => {
    __setTestConfig({
      serviceSid: 'ZS11112222111122221111222211112222',
      env: '.env.example',
    });

    expect(
      readSpecializedConfig('/tmp', '.twilioserverlessrc', 'deploy')
    ).toEqual({
      serviceSid: 'ZS11112222111122221111222211112222',
      env: '.env.example',
    });
  });

  test('merges command-specific config', () => {
    __setTestConfig({
      serviceSid: 'ZS11112222111122221111222211112222',
      commands: {
        deploy: {
          functionsFolder: '/tmp/functions',
        },
      },
    });

    expect(
      readSpecializedConfig('/tmp', '.twilioserverlessrc', 'deploy')
    ).toEqual({
      serviceSid: 'ZS11112222111122221111222211112222',
      functionsFolder: '/tmp/functions',
    });
  });

  test('ignores other command-specific config', () => {
    __setTestConfig({
      serviceSid: 'ZS11112222111122221111222211112222',
      commands: {
        deploy: {
          functionsFolder: '/tmp/functions',
        },
        start: {
          functionsFolder: '/tmp/src',
        },
      },
    });

    expect(
      readSpecializedConfig('/tmp', '.twilioserverlessrc', 'deploy')
    ).toEqual({
      serviceSid: 'ZS11112222111122221111222211112222',
      functionsFolder: '/tmp/functions',
    });
  });

  test('environments override other config', () => {
    __setTestConfig({
      serviceSid: 'ZS11112222111122221111222211112222',
      env: '.env.example',
      commands: {
        deploy: {
          functionsFolder: '/tmp/functions',
        },
      },
      environments: {
        stage: {
          env: '.env.stage',
        },
        '*': {
          env: '.env.prod',
        },
      },
    });

    expect(
      readSpecializedConfig('/tmp', '.twilioserverlessrc', 'deploy', {
        environmentSuffix: 'stage',
      })
    ).toEqual({
      serviceSid: 'ZS11112222111122221111222211112222',
      functionsFolder: '/tmp/functions',
      env: '.env.stage',
    });
  });

  test('account config overrides every other config', () => {
    __setTestConfig({
      serviceSid: 'ZS11112222111122221111222211112222',
      env: '.env.example',
      commands: {
        deploy: {
          functionsFolder: '/tmp/functions',
        },
      },
      environments: {
        stage: {
          serviceSid: 'ZS11112222111122221111222211112223',
          env: '.env.stage',
        },
        '*': {
          env: '.env.prod',
        },
      },
      projects: {
        AC11112222111122221111222211114444: {
          serviceSid: 'ZS11112222111122221111222211114444',
        },
      },
    });

    expect(
      readSpecializedConfig('/tmp', '.twilioserverlessrc', 'deploy', {
        environmentSuffix: 'stage',
        accountSid: 'AC11112222111122221111222211114444',
      })
    ).toEqual({
      serviceSid: 'ZS11112222111122221111222211114444',
      functionsFolder: '/tmp/functions',
      env: '.env.stage',
    });
  });
});
