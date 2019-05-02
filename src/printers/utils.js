const isCi = require('is-ci');
const columnify = require('columnify');
const chalk = require('chalk');

const shouldPrettyPrint = process.stdout.isTTY && !isCi;
const supportsEmoji =
  process.platform !== 'win32' || isCi || process.env.TERM === 'xterm-256color';

function printObjectWithoutHeaders(obj) {
  return columnify(obj, { showHeaders: false });
}

function terminalLink(name, link) {
  return chalk`${name} {dim | ${link}}`;
}

module.exports = {
  shouldPrettyPrint,
  printObjectWithoutHeaders,
  terminalLink,
  supportsEmoji,
};
