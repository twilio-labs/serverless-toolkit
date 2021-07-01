const { createTwilioRunCommand } = require('../src/TwilioRunCommand');

jest.mock(
  'twilio-run/test-command',
  () => {
    return {
      handler: jest.fn(),
      describe: 'Some test description',
      cliInfo: {
        options: {
          region: {
            type: 'string',
            hidden: true,
            describe: 'Twilio API Region',
          },
          edge: {
            type: 'string',
            hidden: true,
            describe: 'Twilio API Region',
          },
          username: {
            type: 'string',
            alias: 'u',
            describe:
              'A specific API key or account SID to be used for deployment. Uses fields in .env otherwise',
          },
          password: {
            type: 'string',
            describe:
              'A specific API secret or auth token for deployment. Uses fields from .env otherwise',
          },
          'load-system-env': {
            default: false,
            type: 'boolean',
            describe:
              'Uses system environment variables as fallback for variables specified in your .env file. Needs to be used with --env explicitly specified.',
          },
        },
      },
    };
  },
  { virtual: true }
);

const command = require('twilio-run/test-command');
const { convertYargsOptionsToOclifFlags } = require('../src/utils');
const TwilioClientCommand = require('@twilio/cli-core/src/base-commands/twilio-client-command');

describe('createTwilioRunCommand', () => {
  test('should create a new class', () => {
    const ResultCommand = createTwilioRunCommand(
      'TestCommand',
      'twilio-run/test-command'
    );
    expect(ResultCommand.name).toBe('TestCommand');
    expect(ResultCommand.description).toBe(command.describe);
    expect(ResultCommand.flags.toString()).toEqual(
      convertYargsOptionsToOclifFlags(command.cliInfo.options).flags.toString()
    );
  });

  test('should add base properties as defined', () => {
    const ResultCommand = createTwilioRunCommand(
      'TestCommand',
      'twilio-run/test-command',
      ['profile']
    );
    expect(ResultCommand.name).toBe('TestCommand');
    expect(ResultCommand.description).toBe(command.describe);
    expect(ResultCommand.flags.profile.toString()).toEqual(
      TwilioClientCommand.flags.profile.toString()
    );
  });

  // takes too long in some runs. We should find a faster way.
  // test('should call the handler', async () => {
  //   const ResultCommand = createTwilioRunCommand(
  //     'TestCommand',
  //     'twilio-run/test-command'
  //   );

  //   await ResultCommand.run(['--region', 'dev']);
  //   expect(command.handler).toHaveBeenCalled();
  // });
});
