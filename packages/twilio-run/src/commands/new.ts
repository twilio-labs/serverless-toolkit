import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import { Arguments, Argv } from 'yargs';
import checkProjectStructure from '../checks/project-structure';
import {
  AllAvailableFlagTypes,
  BaseFlagNames,
  BASE_CLI_FLAG_NAMES,
  getRelevantFlags,
} from '../flags';
import { downloadTemplate, fetchListOfTemplates } from '../templating/actions';
import { logger, setLogLevelByName } from '../utils/logger';
import { ExternalCliOptions } from './shared';
import { CliInfo } from './types';
import { getFullCommand } from './utils';

export type ConfigurableNewCliFlags = Pick<
  AllAvailableFlagTypes,
  BaseFlagNames | 'template'
>;
export type NewCliFlags = Arguments<
  ConfigurableNewCliFlags & {
    namespace?: string;
  }
>;

export type NewConfig = NewCliFlags;

async function getMissingInfo(flags: NewCliFlags): Promise<NewConfig> {
  const questions: inquirer.QuestionCollection[] = [];
  if (!flags.template) {
    const templates = await fetchListOfTemplates();
    const choices = templates.map(template => {
      return {
        name: chalk`${template.name} - {dim ${template.description}}`,
        value: template.id,
      };
    });
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Select a template',
      choices,
    });
  }

  if (!flags.namespace) {
    questions.push({
      type: 'input',
      name: 'namespace',
      message:
        'What should be the namespace your function(s) are placed under?',
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
      namespace: flags.namespace,
      template: flags.template,
    };
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...flags,
    template: flags.template || answers.template,
    namespace: flags.namespace || answers.namespace,
  };
}

function getBaseDirectoryPath(): string {
  const currentDir = process.cwd();
  const baseName = path.basename(currentDir);
  if (
    baseName === 'functions' ||
    baseName === 'assets' ||
    baseName === 'src' ||
    baseName === 'static' ||
    baseName === 'readmes'
  ) {
    return path.resolve(currentDir, '..');
  }
  return currentDir;
}

export async function handler(
  flagsInput: NewCliFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<void> {
  setLogLevelByName(flagsInput.logLevel);

  const targetDirectory = getBaseDirectoryPath();
  const command = getFullCommand(flagsInput);
  await checkProjectStructure(targetDirectory, command, true);

  const flags = await getMissingInfo(flagsInput);

  if (
    typeof flags.namespace === 'undefined' ||
    flags.namespace.length === 0 ||
    typeof flags.template === 'undefined' ||
    flags.namespace.length === 0
  ) {
    return;
  }

  const sanitizedNamespace = flags.namespace.replace(/\.js$/, '');

  try {
    await downloadTemplate(flags.template, sanitizedNamespace, targetDirectory);
  } catch (error) {
    logger.error(error.message, error.name);
  }
}

export const cliInfo: CliInfo = {
  options: {
    ...getRelevantFlags([...BASE_CLI_FLAG_NAMES, 'template']),
  },
};

function optionBuilder(yargs: Argv<any>): Argv<NewCliFlags> {
  yargs = yargs.example(
    '$0 new hello-world --template=blank',
    'Creates a basic blank template as hello-world function'
  );

  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['new [namespace]', 'template [namespace]'];
export const describe =
  'Creates a new Twilio Function based on an existing template';
export const builder = optionBuilder;
