const yargs = require('yargs');

const startCommand = require('./commands/start');
const newCommand = require('./commands/new');

async function run(rawArgs) {
  yargs
    .command(newCommand)
    .command(startCommand)
    .parse(rawArgs.slice(2));
}

module.exports = { run };
