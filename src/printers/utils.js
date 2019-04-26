const isCi = require('is-ci');
const shouldPrettyPrint = process.stdout.isTTY && !isCi;

module.exports = { shouldPrettyPrint };
