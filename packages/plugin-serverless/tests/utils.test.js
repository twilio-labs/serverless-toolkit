const { Flags } = require('@oclif/core');
const {
  normalizeFlags,
  convertYargsOptionsToOclifFlags,
} = require('../src/utils');

describe('normalizeFlags', () => {
  let baseArgv = ['', '/some/path/twilio', 'serverless:deploy', 'test'];
  const baseOutput = {
    $0: 'twilio',
    _: ['serverless:deploy', 'test'],
  };

  beforeEach(() => {
    baseArgv = ['', '/some/path/twilio', 'serverless:deploy', 'test'];
  });

  test('converts kebabcase to camelcase', () => {
    const input = {
      'source-environment': 'dev',
      environment: 'prod',
    };
    const aliasMap = new Map();

    const output = normalizeFlags(input, aliasMap, baseArgv);
    expect(output).toEqual({
      ...baseOutput,
      sourceEnvironment: 'dev',
      'source-environment': 'dev',
      environment: 'prod',
    });
  });

  test('handles aliases correctly if no alias is used', () => {
    const input = {
      'source-environment': 'dev',
      environment: 'prod',
    };
    const aliasMap = new Map();
    aliasMap.set('to', 'environment');

    const output = normalizeFlags(input, aliasMap, baseArgv);
    expect(output).toEqual({
      ...baseOutput,
      sourceEnvironment: 'dev',
      'source-environment': 'dev',
      environment: 'prod',
    });
  });

  test('handles aliases correctly', () => {
    const input = {
      'source-environment': 'dev',
      to: 'prod',
    };
    const aliasMap = new Map();
    aliasMap.set('to', 'environment');

    const output = normalizeFlags(input, aliasMap, baseArgv);
    expect(output).toEqual({
      ...baseOutput,
      sourceEnvironment: 'dev',
      'source-environment': 'dev',
      to: 'prod',
      environment: 'prod',
    });
  });

  test('overrides log-level with cli-log-level if present', () => {
    const input = {
      'log-level': 'info',
      'cli-log-level': 'debug',
      environment: 'prod',
    };
    const aliasMap = new Map();

    const output = normalizeFlags(input, aliasMap, baseArgv);
    expect(output).toEqual({
      ...baseOutput,
      'log-level': 'info',
      'cli-log-level': 'debug',
      cliLogLevel: 'debug',
      logLevel: 'debug',
      environment: 'prod',
    });
  });

  test('uses regular log-level if no cli-log-level is present', () => {
    const input = {
      'log-level': 'debug',
      environment: 'prod',
    };
    const aliasMap = new Map();

    const output = normalizeFlags(input, aliasMap, baseArgv);
    expect(output).toEqual({
      ...baseOutput,
      'log-level': 'debug',
      logLevel: 'debug',
      environment: 'prod',
    });
  });
});

describe('convertYargsOptionsToOclifFlags', () => {
  test('should convert basic yargs flag definitions to Oclif', () => {
    const yargsFlags = {
      'service-sid': {
        type: 'string',
        describe: 'SID of the Twilio Serverless Service to deploy to',
      },
      production: {
        type: 'boolean',
        describe:
          'Promote build to the production environment (no domain suffix). Overrides environment flag',
        default: false,
      },
    };

    const result = convertYargsOptionsToOclifFlags(yargsFlags);
    expect(result.aliasMap.size).toEqual(0);
    expect(result.flags.toString()).toEqual(
      {
        production: Flags.boolean({
          description: yargsFlags.production.describe,
          default: yargsFlags.production.default,
          hidden: undefined,
        }),
        'service-sid': Flags.string({
          description: yargsFlags['service-sid'].describe,
          default: yargsFlags['service-sid'].default,
          hidden: undefined,
        }),
      }.toString()
    );
  });

  test('should handle required arguments', () => {
    const yargsFlags = {
      'service-sid': {
        type: 'string',
        describe: 'SID of the Twilio Serverless Service to deploy to',
        requiresArg: true,
      },
      production: {
        type: 'boolean',
        describe:
          'Promote build to the production environment (no domain suffix). Overrides environment flag',
        default: false,
      },
    };

    const result = convertYargsOptionsToOclifFlags(yargsFlags);
    expect(result.aliasMap.size).toEqual(0);
    expect(result.flags.toString()).toEqual(
      {
        production: Flags.boolean({
          description: yargsFlags.production.describe,
          default: yargsFlags.production.default,
          hidden: undefined,
        }),
        'service-sid': Flags.string({
          description: yargsFlags['service-sid'].describe,
          default: yargsFlags['service-sid'].default,
          hidden: undefined,
          required: true,
        }),
      }.toString()
    );
  });

  test('should handle numbers', () => {
    const yargsFlags = {
      port: {
        type: 'number',
        describe: 'the port to listen on',
      },
      production: {
        type: 'boolean',
        describe:
          'Promote build to the production environment (no domain suffix). Overrides environment flag',
        default: false,
      },
    };

    const result = convertYargsOptionsToOclifFlags(yargsFlags);
    expect(result.aliasMap.size).toEqual(0);
    expect(result.flags.toString()).toEqual(
      {
        production: Flags.boolean({
          description: yargsFlags.production.describe,
          default: yargsFlags.production.default,
          hidden: undefined,
        }),
        port: Flags.string({
          description: yargsFlags.port.describe,
          default: yargsFlags.port.default,
          hidden: undefined,
        }),
      }.toString()
    );
    expect(result.flags.port.parse('8000')).toEqual(8000);
  });

  test('should handle single letter aliases', () => {
    const yargsFlags = {
      'service-sid': {
        type: 'string',
        describe: 'SID of the Twilio Serverless Service to deploy to',
      },
      production: {
        type: 'boolean',
        describe:
          'Promote build to the production environment (no domain suffix). Overrides environment flag',
        default: false,
      },
      username: {
        type: 'string',
        alias: 'u',
        describe:
          'A specific API key or account SID to be used for deployment. Uses fields in .env otherwise',
      },
    };

    const result = convertYargsOptionsToOclifFlags(yargsFlags);
    expect(result.aliasMap.size).toEqual(0);
    expect(result.flags.toString()).toEqual(
      {
        production: Flags.boolean({
          description: yargsFlags.production.describe,
          default: yargsFlags.production.default,
          hidden: undefined,
        }),
        'service-sid': Flags.string({
          description: yargsFlags['service-sid'].describe,
          default: yargsFlags['service-sid'].default,
          hidden: undefined,
        }),
        username: Flags.string({
          description: yargsFlags['username'].describe,
          default: yargsFlags['username'].default,
          hidden: undefined,
          char: 'u',
        }),
      }.toString()
    );
  });

  test('should handle long-form aliases', () => {
    const yargsFlags = {
      'service-sid': {
        type: 'string',
        describe: 'SID of the Twilio Serverless Service to deploy to',
      },
      production: {
        type: 'boolean',
        describe:
          'Promote build to the production environment (no domain suffix). Overrides environment flag',
        default: false,
      },
      'source-environment': {
        type: 'string',
        alias: 'from',
        describe:
          'SID or suffix of an existing environment you want to deploy from.',
      },
      environment: {
        type: 'string',
        alias: 'to',
        describe:
          'The environment name (domain suffix) you want to use for your deployment',
        default: 'dev',
      },
    };

    const result = convertYargsOptionsToOclifFlags(yargsFlags);
    expect([...result.aliasMap.entries()]).toEqual([
      ['from', 'source-environment'],
      ['to', 'environment'],
    ]);
    expect(result.flags.toString()).toEqual(
      {
        production: Flags.boolean({
          description: yargsFlags.production.describe,
          default: yargsFlags.production.default,
          hidden: undefined,
        }),
        'service-sid': Flags.string({
          description: yargsFlags['service-sid'].describe,
          default: yargsFlags['service-sid'].default,
          hidden: undefined,
        }),
        'source-environment': Flags.string({
          description: yargsFlags['source-environment'].describe,
          default: yargsFlags['source-environment'].default,
          hidden: undefined,
        }),
        from: Flags.string({
          description: '[Alias for "source-environment"]',
          default: undefined,
          hidden: undefined,
        }),
        environment: Flags.string({
          description: yargsFlags['environment'].describe,
          default: yargsFlags['environment'].default,
          hidden: undefined,
        }),
        to: Flags.string({
          description: '[Alias for "environment"]',
          default: undefined,
          hidden: undefined,
        }),
      }.toString()
    );
  });
});
