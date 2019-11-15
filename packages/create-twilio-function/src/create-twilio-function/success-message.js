const { getPackageManager } = require('pkg-install');
const chalk = require('chalk');
const wrap = require('wrap-ansi');

const getWindowSize = require('./window-size');

async function successMessage(config) {
  const packageManager = await getPackageManager({ cwd: process.cwd() });
  return wrap(
    chalk`{green Success!}

Created {bold ${config.name}} at {bold ${config.path}}

Inside that directory, you can run the following command:

{blue ${packageManager} start}
  Serves all functions in the ./functions subdirectory and assets in the
  ./assets directory

Get started by running:

{blue cd ${config.name}}
{blue ${packageManager} start}`,
    getWindowSize().width - 8,
    {
      trim: false,
      hard: true,
    },
  );
}

module.exports = successMessage;
