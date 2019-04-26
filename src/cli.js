const yargs = require('yargs');
const chalk = require('chalk');

const startCommand = require('./commands/start');
const newCommand = require('./commands/new');
const deployCommand = require('./commands/deploy');
const listCommand = require('./commands/list');
const activateCommand = require('./commands/activate');

async function run(rawArgs) {
  const nodeVersion = process.versions.node;
  if (!nodeVersion.startsWith('8.10')) {
    const msg = chalk`
{red.bold INVALID NODE.JS Version}

You are currently running ${nodeVersion} but the Twilio Runtime is 8.10.

Please use a tool like nvm (https://github.com/creationix/nvm) to switch your version of Node.js.
`.trim();
    console.error(msg);
    process.exit(1);
  }
  yargs
    .command(newCommand)
    .command(deployCommand)
    .command(listCommand)
    .command(activateCommand)
    .command(startCommand)
    .parse(rawArgs.slice(2));
}

module.exports = { run };
