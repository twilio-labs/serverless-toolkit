import chalk from 'chalk';
import ora from 'ora';
import { Argv } from 'yargs';
import { fetchListOfTemplates } from '../templating/actions';
import { CliInfo } from './types';

export async function handler(): Promise<void> {
  const spinner = ora('Fetching available templates').start();

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
    console.log(
      chalk`‣ ${template.name} ({cyan ${template.id}})\n  {dim ${template.description}}`
    );
  });
}

export const cliInfo: CliInfo = { options: {} };
export const command = ['list-templates'];
export const describe = 'Lists the available Twilio Function templates';
