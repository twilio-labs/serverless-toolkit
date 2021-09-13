import chalk from 'chalk';
import { Arguments, Argv } from 'yargs';
import { BaseFlags, getRelevantFlags } from '../flags';
import { fetchListOfTemplates } from '../templating/actions';
import { getOraSpinner, setLogLevelByName } from '../utils/logger';
import { writeOutput, writeJSONOutput } from '../utils/output';
import { CliInfo } from './types';

export async function handler(
  flags: Arguments<BaseFlags & { outputFormat?: string }>
): Promise<void> {
  setLogLevelByName(flags.logLevel);
  const spinner = getOraSpinner('Fetching available templates').start();

  let templates;
  try {
    templates = await fetchListOfTemplates();
  } catch (err) {
    spinner.fail('Failed to retrieve templates');
    process.exitCode = 1;
    return;
  }

  spinner.stop();

  if (flags.outputFormat === 'json') {
    writeJSONOutput(templates);
  } else {
    templates.forEach((template) => {
      writeOutput(
        chalk`‣ ${template.name} ({cyan ${template.id}})\n  {dim ${template.description}}`
      );
    });
  }
}

export const cliInfo: CliInfo = {
  options: { ...getRelevantFlags(['output-format']) },
};

function optionBuilder(yargs: Argv<any>): Argv<Arguments<BaseFlags>> {
  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['list-templates'];
export const describe = 'Lists the available Twilio Function templates';
export const builder = optionBuilder;
