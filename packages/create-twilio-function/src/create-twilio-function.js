const { promptForAccountDetails } = require('./create-twilio-function/prompt');
const {
  createDirectory,
  createEnvFile,
  createExampleFunction,
  createGitignore,
  createPackageJSON
} = require('./create-twilio-function/create-files');

async function createTwilioFunction(config) {
  accountDetails = await promptForAccountDetails(config);
  config = { ...accountDetails, ...config };

  await createDirectory(config.path, config.name);
  const projectDir = `${config.path}/${config.name}`;
  await createDirectory(projectDir, 'functions');
  await createDirectory(projectDir, 'assets');
  await createEnvFile(projectDir, {
    accountSid: config.accountSid,
    authToken: config.authToken
  });
  await createGitignore(projectDir);
  await createExampleFunction(`${projectDir}/functions`);
  await createPackageJSON(projectDir, config.name);
}

module.exports = createTwilioFunction;
