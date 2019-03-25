const { promptForAccountDetails } = require('./create-twilio-function/prompt');
const {
  createDirectory,
  createEnvFile,
  createExampleFunction,
  createGitignore,
  createPackageJSON
} = require('./create-twilio-function/create-files');
const {
  installDependencies
} = require('./create-twilio-function/install-dependencies');
const ora = require('ora');

async function createTwilioFunction(config) {
  const projectDir = `${config.path}/${config.name}`;
  try {
    await createDirectory(config.path, config.name);
    // Get account sid and auth token
    accountDetails = await promptForAccountDetails(config);
    config = { ...accountDetails, ...config };

    // Scaffold project
    const spinner = ora('Creating project directories and files').start();
    await createDirectory(projectDir, 'functions');
    await createDirectory(projectDir, 'assets');
    await createEnvFile(projectDir, {
      accountSid: config.accountSid,
      authToken: config.authToken
    });
    await createGitignore(projectDir);
    await createExampleFunction(`${projectDir}/functions`);
    await createPackageJSON(projectDir, config.name);
    spinner.succeed();

    // Install dependencies with npm
    spinner.start('Installing dependencies');
    await installDependencies(projectDir);
    spinner.succeed();
  } catch (e) {
    console.log(
      `A directory called '${
        config.name
      }' already exists. Please create your function in a new directory.`
    );
  }
}

module.exports = createTwilioFunction;
