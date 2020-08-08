import chalk from 'chalk';
import { Arguments } from 'yargs';
import { fetchListOfTemplates } from '../templating/actions';
import { getOraSpinner, setLogLevelByName } from '../utils/logger';
import { writeOutput } from '../utils/output';
import { baseCliOptions, BaseFlags } from './shared';
import { CliInfo } from './types';

export async function handler(flags: Arguments<BaseFlags>): Promise<void> {
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

  templates.forEach(template => {
    writeOutput(
      chalk`‣ ${template.name} ({cyan ${template.id}})\n  {dim ${template.description}}`
    );
  });
}

export const cliInfo: CliInfo = { options: { ...baseCliOptions } };
export const command = ['list-templates'];
export const describe = 'Lists the available Twilio Function templates';
