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

async function createTwilioFunction(config) {
  const projectDir = `${config.path}/${config.name}`;
  try {
    await createDirectory(config.path, config.name);
    // Get account sid and auth token
    accountDetails = await promptForAccountDetails(config);
    config = { ...accountDetails, ...config };

    // Scaffold project
    await createDirectory(projectDir, 'functions');
    await createDirectory(projectDir, 'assets');
    await createEnvFile(projectDir, {
      accountSid: config.accountSid,
      authToken: config.authToken
    });
    await createGitignore(projectDir);
    await createExampleFunction(`${projectDir}/functions`);
    await createPackageJSON(projectDir, config.name);

    // Install dependencies with npm
    await installDependencies(projectDir);
  } catch (e) {
    console.log(
      `A directory called '${
        config.name
      }' already exists. Please create your function in a new directory.`
    );
  }
}

module.exports = createTwilioFunction;
