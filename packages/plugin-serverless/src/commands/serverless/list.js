// const { Command } = require('@oclif/command');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;

const { handler, cliInfo, describe } = require('twilio-run/dist/commands/list');
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
} = require('../../utils');

class FunctionsList extends TwilioClientCommand {
  constructor(argv, config, secureStorage) {
    super(argv, config, secureStorage);

    this.showHeaders = true;
  }

  async runCommand() {
    let { flags, args } = this.parse(FunctionsList);
    flags = normalizeFlags(flags);

    if (flags.project === 'default') {
      flags._cliDefault = {
        username: this.twilioClient.username,
        password: this.twilioClient.password,
      };
    } else {
      flags.accountSid = flags.accountSid || this.twilioClient.username;
      flags.authToken = flags.authToken || this.twilioClient.password;
    }

    const opts = Object.assign({}, flags, args);
    return handler(opts);
  }
}

FunctionsList.description = describe;

FunctionsList.args = [
  {
    name: 'types',
    required: false,
    default: cliInfo.argsDefaults.types,
    description:
      'Comma seperated list of things to list (services,environments,functions,assets,variables)',
  },
];

FunctionsList.flags = Object.assign(
  convertYargsOptionsToOclifFlags(cliInfo.options),
  { project: TwilioClientCommand.flags.project }
);

module.exports = FunctionsList;
