const yargs = require('yargs');
const chalk = require('chalk');

const startCommand = require('./commands/start');
const newCommand = require('./commands/new');
const deployCommand = require('./commands/deploy');
const listCommand = require('./commands/list');
const activateCommand = require('./commands/activate');

async function run(rawArgs) {
  yargs
    .command(newCommand)
    .command(deployCommand)
    .command(listCommand)
    .command(activateCommand)
    .command(startCommand)
    .parse(rawArgs.slice(2));
}

module.exports = { run };
