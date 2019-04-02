const { getPackageManager } = require('pkg-install');
const chalk = require('chalk');

async function successMessage(config) {
  const packageManager = await getPackageManager({ cwd: process.cwd() });
  return chalk`{green Success!}

  Created {bold ${config.name}} at ${config.path}

  Inside that directory, you can run the following command:

  {blue ${packageManager} start}
    Serves all functions in the ./functions subdirectory

  Get started by running:

  {blue cd ${config.name}}
  {blue ${packageManager} start}`;
}

module.exports = successMessage;
