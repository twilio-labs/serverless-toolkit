import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import prompts from 'prompts';
import { Merge } from 'type-fest';
import { Arguments, Argv } from 'yargs';
import checkProjectStructure from '../checks/project-structure';
import { CliInfo } from './types';
import { getFullCommand } from './utils';
import { downloadTemplate, fetchListOfTemplates } from '../templating/actions';

export type NewCliFlags = Arguments<{
  filename?: string;
  template?: string;
  list?: string;
}>;

export type NewConfig = Merge<
  NewCliFlags,
  {
    filename?: string;
    template?: string;
  }
>;

async function listTemplates(): Promise<void> {
  const spinner = ora('Fetching available templates').start();

  let templates;
  try {
    templates = await fetchListOfTemplates();
  } catch (err) {
    spinner.fail('Failed to retrieve templates');
    process.exit(1);
    return;
  }

  spinner.stop();

  templates.forEach(template => {
    console.log(
      chalk`‣ ${template.name} ({cyan ${template.id}})\n  {dim ${template.description}}`
    );
  });
}

async function getMissingInfo(flags: NewCliFlags): Promise<NewConfig> {
  const questions: prompts.PromptObject[] = [];
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
      validate: (input: string) => {
        if (input.length < 1 || input.includes(' ')) {
          return 'Your name cannot include whitespace';
        }
        return true;
      },
    });
  }

  if (questions.length === 0) {
    return {
      ...flags,
      filename: flags.filename,
      template: flags.template,
    };
  }

  const answers = await prompts(questions);
  return {
    ...flags,
    template: flags.template || answers.template,
    filename: flags.filename || answers.filename,
  };
}

function getBaseDirectoryPath(): string {
  const currentDir = process.cwd();
  const baseName = path.basename(currentDir);
  if (
    baseName === 'functions' ||
    baseName === 'assets' ||
    baseName === 'src' ||
    baseName === 'static'
  ) {
    return path.resolve(currentDir, '..');
  }
  return currentDir;
}

export async function handler(flagsInput: NewCliFlags): Promise<void> {
  if (flagsInput.list) {
    await listTemplates();
    process.exit(0);
    return;
  }

  const targetDirectory = getBaseDirectoryPath();
  const command = getFullCommand(flagsInput);
  await checkProjectStructure(targetDirectory, command, true);

  const flags = await getMissingInfo(flagsInput);

  if (
    typeof flags.filename === 'undefined' ||
    flags.filename.length === 0 ||
    typeof flags.template === 'undefined' ||
    flags.filename.length === 0
  ) {
    return;
  }

  const bundleName = flags.filename.replace(/\.js$/, '');

  downloadTemplate(flags.template, bundleName, targetDirectory);
}

export const cliInfo: CliInfo = {
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

function optionBuilder(yargs: Argv<any>): Argv<NewCliFlags> {
  yargs = yargs
    .example(
      '$0 new hello-world --template=blank',
      'Creates a basic blank template as hello-world function'
    )
    .example('$0 new --list', 'Lists all available templates');

  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['new [filename]', 'template [filename]'];
export const describe =
  'Creates a new Twilio Function based on an existing template';
export const builder = optionBuilder;
