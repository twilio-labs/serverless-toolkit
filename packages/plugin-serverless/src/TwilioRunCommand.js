const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
  createExternalCliOptions,
  getRegionAndEdge,
} = require('./utils');

const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;

function createTwilioRunCommand(name, path, inheritedFlags = []) {
  const { handler, cliInfo, describe } = require(path);
  const { flags, aliasMap } = convertYargsOptionsToOclifFlags(cliInfo.options);

  const commandClass = class extends TwilioClientCommand {
    async run() {
      await super.run();

      const flags = normalizeFlags(this.flags, aliasMap, process.argv);

      const externalOptions = createExternalCliOptions(
        flags,
        this.twilioClient
      );

      const { edge, region } = getRegionAndEdge(flags, this);
      flags.region = region;
      flags.edge = edge;

      const opts = Object.assign({}, flags, this.args);

      return handler(opts, externalOptions);
    }
  };

  const inheritedFlagObject = inheritedFlags.reduce((current, flag) => {
    return {
      ...current,
      [flag]: TwilioClientCommand.flags[flag],
    };
  }, {});

  Object.defineProperty(commandClass, 'name', { value: name });
  commandClass.description = describe;
  commandClass.flags = Object.assign(flags, inheritedFlagObject);

  return commandClass;
}

module.exports = { createTwilioRunCommand };
