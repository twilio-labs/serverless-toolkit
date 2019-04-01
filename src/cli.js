const yargs = require('yargs');

const startCommand = require('./commands/start');

async function run(rawArgs) {
  yargs
    .command(startCommand)
    .parse(rawArgs.slice(2));
}

module.exports = { run };
