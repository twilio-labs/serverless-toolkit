const camelCase = require('lodash.camelcase');
const { flags } = require('@oclif/command');

function convertYargsOptionsToOclifFlags(options) {
  const flagsResult = Object.keys(options).reduce((result, name) => {
    const opt = options[name];
    const flag = {
      description: opt.describe,
      default: opt.default,
    };

    if (opt.type === 'string') {
      flag.default = flag.default || '';
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
  return Object.keys(flags).reduce((current, name) => {
    if (name.includes('-')) {
      const normalizedName = camelCase(name);
      current[normalizedName] = flags[name];
    }
    return current;
  }, flags);
}

module.exports = { convertYargsOptionsToOclifFlags, normalizeFlags };
