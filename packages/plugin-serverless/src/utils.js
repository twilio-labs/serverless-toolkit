const path = require('path');
const camelCase = require('lodash.camelcase');
const { flags } = require('@oclif/command');

function convertYargsOptionsToOclifFlags(options) {
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

    if (opt.alias) {
      flag.char = opt.alias;
    }

    if (opt.requiresArg) {
      flag.required = opt.requiresArg;
    }

    result[name] = flags[opt.type](flag);
    return result;
  }, {});
  return flagsResult;
}

function normalizeFlags(flags) {
  const result = Object.keys(flags).reduce((current, name) => {
    if (name.includes('-')) {
      const normalizedName = camelCase(name);
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

  return {
    username: twilioClient.username,
    password: twilioClient.password,
    accountSid: twilioClient.accountSid,
    profile,
    logLevel: undefined,
    outputFormat: undefined,
  };
}

module.exports = {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
  createExternalCliOptions,
};
