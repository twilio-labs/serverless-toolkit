const {
  promptForAccountDetails,
  promptForProjectName
} = require('./create-twilio-function/prompt');
const validateProjectName = require('./create-twilio-function/validate-project-name');
const {
  createDirectory,
  createEnvFile,
  createExampleFromTemplates,
  createPackageJSON,
  createNvmrcFile
} = require('./create-twilio-function/create-files');
const createGitignore = require('./create-twilio-function/create-gitignore');
const importCredentials = require('./create-twilio-function/import-credentials');
const {
  installDependencies
} = require('./create-twilio-function/install-dependencies');
const successMessage = require('./create-twilio-function/success-message');
const ora = require('ora');
const boxen = require('boxen');
const { downloadTemplate } = require('twilio-run/dist/templating/actions');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const path = require('path');

async function cleanUpAndExit(projectDir, spinner, errorMessage) {
  spinner.fail(errorMessage);
  spinner.start('Cleaning up project directories and files');
  await rimraf(projectDir);
  spinner.stop().clear();
  process.exitCode = 1;
}

async function createTwilioFunction(config) {
  const { valid, errors } = validateProjectName(config.name);
  if (!valid) {
    const { name } = await promptForProjectName(errors);
    config.name = name;
  }
  const projectDir = path.join(config.path, config.name);
  const spinner = ora();

  try {
    spinner.start('Creating project directory');
    await createDirectory(config.path, config.name);
    spinner.succeed();
  } catch (e) {
    switch (e.code) {
      case 'EEXIST':
        spinner.fail(
          `A directory called '${
            config.name
          }' already exists. Please create your function in a new directory.`
        );
        break;
      case 'EACCES':
        spinner.fail(
          `You do not have permission to create files or directories in the path '${
            config.path
          }'.`
        );
        break;
      default:
        spinner.fail(e.message);
    }
    process.exitCode = 1;
    return;
  }

  // Get account sid and auth token
  let accountDetails = await importCredentials(config);
  if (Object.keys(accountDetails).length === 0) {
    accountDetails = await promptForAccountDetails(config);
  }
  config = { ...accountDetails, ...config };

  // Scaffold project
  spinner.start('Creating project directories and files');

  await createEnvFile(projectDir, {
    accountSid: config.accountSid,
    authToken: config.authToken
  });
  await createNvmrcFile(projectDir);
  await createPackageJSON(projectDir, config.name);
  if (config.template) {
    spinner.succeed();
    spinner.start(`Downloading template: "${config.template}"`);
    await createDirectory(projectDir, 'functions');
    await createDirectory(projectDir, 'assets');
    try {
      await downloadTemplate(config.template, '', projectDir);
      spinner.succeed();
    } catch (err) {
      await cleanUpAndExit(
        projectDir,
        spinner,
        `The template "${config.template}" doesn't exist`
      );
      return;
    }
  } else {
    await createExampleFromTemplates(projectDir);
    spinner.succeed();
  }

  // Download .gitignore file from https://github.com/github/gitignore/
  try {
    spinner.start('Downloading .gitignore file');
    await createGitignore(projectDir);
    spinner.succeed();
  } catch (err) {
    cleanUpAndExit(projectDir, spinner, 'Could not download .gitignore file');
    return;
  }

  // Install dependencies with npm
  try {
    spinner.start('Installing dependencies');
    await installDependencies(projectDir);
    spinner.succeed();
  } catch (err) {
    spinner.fail();
    console.log(
      `There was an error installing the dependencies, but your project is otherwise complete in ./${
        config.name
      }`
    );
  }

  // Success message

  console.log(
    boxen(await successMessage(config), { padding: 1, borderStyle: 'round' })
  );
}

module.exports = createTwilioFunction;
