const isCi = require('is-ci');
const columnify = require('columnify');

const shouldPrettyPrint = process.stdout.isTTY && !isCi;

function printObjectWithoutHeaders(obj) {
  return columnify(obj, { showHeaders: false });
}

module.exports = { shouldPrettyPrint, printObjectWithoutHeaders };
