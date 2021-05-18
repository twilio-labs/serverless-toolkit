const path = require('path');
const camelCase = require('lodash.camelcase');
const { flags } = require('@oclif/command');

function convertYargsOptionsToOclifFlags(options) {
  const aliasMap = new Map();
  const flagsResult = Object.keys(options).reduce((result, name) => {
    const opt = options[name];
    const flag = {
      description: opt.describe,
      default: opt.default,
      hidden: opt.hidden,
    };

    if (typeof opt.default !== 'undefined') {
      flag.default = opt.default;

      if (opt.type === 'boolean') {
        if (flag.default === true) {
          flag.allowNo = true;
        }
      }
    }

    if (opt.type === 'number') {
      opt.type = 'string';
      flag.parse = (input) => parseFloat(input);
    }

    if (opt.alias && opt.alias.length === 1) {
      flag.char = opt.alias;
    }

    if (opt.requiresArg) {
      flag.required = opt.requiresArg;
    }

    result[name] = flags[opt.type](flag);

    if (opt.alias && opt.alias.length > 1) {
      result[opt.alias] = flags[opt.type](flag);
      aliasMap.set(opt.alias, name);
    }

    return result;
  }, {});
  return { flags: flagsResult, aliasMap };
}

function normalizeFlags(flags, aliasMap) {
  const result = Object.keys(flags).reduce((current, name) => {
    const normalizedName = name.includes('-') ? camelCase(name) : name;

    if (aliasMap.has(normalizedName)) {
      const actualName = camelCase(aliasMap.get(normalizedName));
      current[actualName] = flags[name];
    } else {
      current[normalizedName] = flags[name];
    }
    return current;
  }, flags);
  const [, command, ...args] = process.argv;
  result.$0 = path.basename(command);
  result._ = args;

  return result;
}

function createExternalCliOptions(flags, twilioClient) {
  const profile = flags.profile;

  if (flags.username || flags.password) {
    return {
      username: flags.username,
      password: flags.password,
      accountSid: flags.username.startsWith('AC') ? flags.username : undefined,
      profile: undefined,
      logLevel: undefined,
      outputFormat: undefined,
    };
  }

  return {
    username: twilioClient.username,
    password: twilioClient.password,
    accountSid: twilioClient.accountSid,
    profile,
    logLevel: undefined,
    outputFormat: undefined,
  };
}

function getRegionAndEdge(flags, clientCommand) {
  const edge =
    flags.edge || process.env.TWILIO_EDGE || clientCommand.userConfig.edge;
  const region = flags.region || clientCommand.currentProfile.region;

  return { edge, region };
}

module.exports = {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
  createExternalCliOptions,
  getRegionAndEdge,
};
