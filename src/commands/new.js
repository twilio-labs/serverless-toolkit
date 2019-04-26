const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const prompts = require('prompts');
const {
  fetchListOfTemplates,
  getTemplateFiles,
} = require('../templating/data');
const { writeFiles } = require('../templating/filesystem');

async function listTemplates() {
  const spinner = ora('Fetching available templates').start();

  let templates;
  try {
    templates = await fetchListOfTemplates();
  } catch (err) {
    spinner.fail('Failed to retrieve templates');
    process.exit(1);
  }

  spinner.stop();

  templates.forEach(template => {
    console.log(
      chalk`‣ ${template.name} ({cyan ${template.id}})\n  {dim ${
        template.description
      }}`
    );
  });
}

async function getMissingInfo(flags) {
  const questions = [];
  if (!flags.template) {
    const templates = await fetchListOfTemplates();
    const choices = templates.map(template => {
      return {
        title: chalk`${template.name} - {dim ${template.description}}`,
        value: template.id,
      };
    });
    questions.push({
      type: 'select',
      name: 'template',
      message: 'Select a template',
      choices,
    });
  }

  if (!flags.filename) {
    questions.push({
      type: 'text',
      name: 'filename',
      message: 'What should be the name of your function?',
      validate: input => {
        if (input.length < 1 || input.includes(' ')) {
          return 'Your name cannot include whitespace';
        }
        return true;
      },
    });
  }

  if (questions.length === 0) {
    return flags;
  }

  const answers = await prompts(questions);
  return {
    ...flags,
    template: flags.template || answers.template,
    filename: flags.filename || answers.filename,
  };
}

function getBaseDirectoryPath() {
  const currentDir = process.cwd();
  if (
    path.basename(currentDir) === 'functions' ||
    path.basename(currentDir) === 'assets'
  ) {
    return path.resolve(currentDir, '..');
  }
  return currentDir;
}

async function handler(flags) {
  if (flags.list) {
    await listTemplates();
    process.exit(0);
  }

  flags = await getMissingInfo(flags);
  const targetDirectory = getBaseDirectoryPath();
  const functionName = flags.filename.replace(/\.js$/, '');
  const files = await getTemplateFiles(flags.template, functionName);
  try {
    await writeFiles(files, targetDirectory, functionName);
    console.log(chalk`{green SUCCESS} Created new function ${functionName}`);
  } catch (err) {
    console.error(chalk`{red ERROR} ${err.message}`);
  }
}

const cliInfo = {
  options: {
    template: {
      type: 'string',
      description: 'Name of template to be used',
    },
    list: {
      type: 'boolean',
      alias: 'l',
      describe: chalk`List available templates. Will {bold not} create a new function`,
    },
  },
};

function optionBuilder(yargs) {
  yargs = yargs
    .example(
      '$0 new hello-world --template=reply-sms',
      'Creates a basic reply SMS template as hello-world function'
    )
    .example('$0 new --list', 'Lists all available templates');

  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

module.exports = {
  command: ['new [filename]', 'template [filename]'],
  describe: 'Creates a new Twilio Function based on an existing template',
  builder: optionBuilder,
  handler,
  cliInfo,
};
