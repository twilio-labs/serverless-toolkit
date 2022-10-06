const { promisify } = require('util');
const path = require('path');

const ora = require('ora');
const boxen = require('boxen');
const rimraf = promisify(require('rimraf'));
const { downloadTemplate } = require('twilio-run/dist/templating/actions');

const {
  promptForAccountDetails,
  promptForProjectName,
} = require('./create-twilio-function/prompt');
const validateProjectName = require('./create-twilio-function/validate-project-name');
const {
  createDirectory,
  createEnvFile,
  createExampleFromTemplates,
  createPackageJSON,
  createNvmrcFile,
  createTsconfigFile,
  createEmptyFileStructure,
  createServerlessConfigFile,
} = require('./create-twilio-function/create-files');
const createGitignore = require('./create-twilio-function/create-gitignore');
const importCredentials = require('./create-twilio-function/import-credentials');
const {
  installDependencies,
} = require('./create-twilio-function/install-dependencies');
const successMessage = require('./create-twilio-function/success-message');

async function cleanUpAndExit(projectDir, spinner, errorMessage) {
  spinner.fail(errorMessage);
  spinner.start('Cleaning up project directories and files');
  try {
    await rimraf(projectDir);
  } catch (error) {
    spinner.fail(
      `There was an error cleaning up the project. Some files may still be present in ${projectDir}`
    );
  } finally {
    spinner.stop().clear();
    process.exitCode = 1;
  }
}

async function performTaskWithSpinner(spinner, message, task) {
  spinner.start(message);
  await task();
  spinner.succeed();
}

async function createTwilioFunction(config) {
  const { valid, errors } = validateProjectName(config.name);
  if (!valid) {
    const { name } = await promptForProjectName(errors);
    config.name = name;
  }
  const projectDir = path.join(config.path, config.name);
  const projectType = config.typescript ? 'typescript' : 'javascript';
  const spinner = ora();

  // Check to see if the request is valid for a template or an empty project
  if (config.empty && config.template) {
    await cleanUpAndExit(
      projectDir,
      spinner,
      'You cannot scaffold an empty Functions project with a template. Please choose empty or a template.'
    );
    return;
  }
  // Check to see if the project wants typescript and a template
  if (config.template && projectType === 'typescript') {
    await cleanUpAndExit(
      projectDir,
      spinner,
      'There are no TypeScript templates available. You can generate an example project or an empty one with the --empty flag.'
    );
    return;
  }

  try {
    await performTaskWithSpinner(
      spinner,
      'Creating project directory',
      async () => {
        await createDirectory(config.path, config.name);
      }
    );
  } catch (e) {
    if (e.code === 'EEXIST') {
      spinner.fail(
        `A directory called '${config.name}' already exists. Please create your function in a new directory.`
      );
    } else if (e.code === 'EACCES') {
      spinner.fail(
        `You do not have permission to create files or directories in the path '${config.path}'.`
      );
    } else {
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
  config = {
    ...accountDetails,
    ...config,
  };

  // Scaffold project
  spinner.start('Creating project directories and files');

  await createEnvFile(projectDir, {
    accountSid: config.accountSid,
    authToken: config.authToken,
  });
  await createNvmrcFile(projectDir);
  await createPackageJSON(projectDir, config.name, projectType);
  await createServerlessConfigFile(projectDir);
  if (projectType === 'typescript') {
    await createTsconfigFile(projectDir);
  }
  if (config.template) {
    spinner.succeed();
    spinner.start(`Downloading template: "${config.template}"`);
    await createDirectory(projectDir, 'functions');
    await createDirectory(projectDir, 'assets');
    try {
      await downloadTemplate(config.template, '', projectDir);
    } catch (err) {
      await cleanUpAndExit(
        projectDir,
        spinner,
        `The template "${config.template}" doesn't exist`
      );
      return;
    }
  } else if (config.empty) {
    await createEmptyFileStructure(projectDir, projectType);
  } else {
    await createExampleFromTemplates(projectDir, projectType);
  }
  spinner.succeed();

  // Download .gitignore file from https://github.com/github/gitignore/
  try {
    await performTaskWithSpinner(
      spinner,
      'Downloading .gitignore file',
      async () => {
        await createGitignore(projectDir);
      }
    );
  } catch (err) {
    cleanUpAndExit(projectDir, spinner, 'Could not download .gitignore file');
    return;
  }

  // Install dependencies with npm
  try {
    await performTaskWithSpinner(
      spinner,
      'Installing dependencies',
      async () => {
        await installDependencies(projectDir);
      }
    );
  } catch (err) {
    spinner.fail();
    console.log(
      `There was an error installing the dependencies, but your project is otherwise complete in ./${config.name}`
    );
  }

  // Success message

  console.log(
    boxen(await successMessage(config), {
      padding: 1,
      borderStyle: 'round',
    })
  );
}

module.exports = createTwilioFunction;
