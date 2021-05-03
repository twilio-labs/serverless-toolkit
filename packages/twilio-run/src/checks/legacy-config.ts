import { stripIndent } from 'common-tags';
import inquirer from 'inquirer';
import path from 'path';
import { fileExistsSync } from '../utils/fs';
import { logger } from '../utils/logger';

export function printConfigWarning() {
  const title = 'Legacy Configuration Detected';
  const msg = stripIndent`
    We found a .twilio-functions file in your project. This file is incompatible with the current version of the CLI you are using and will be ignored.

    In most cases you will be able to delete the existing .twilio-functions file. If you have any configuration/modifications you did to the file yourself, head over to https://twil.io/serverlessv3 to learn how to migrate your configuration.
  `;

  logger.warn(msg, title);
}

export async function promptForContinue(): Promise<boolean> {
  const answers = await inquirer.prompt([
    {
      name: 'continue',
      type: 'confirm',
      default: true,
      message: 'Do you want to continue with the ignored configuration?',
    },
  ]);
  return answers.continue;
}

/**
 * This function checks if there is a .twilio-functions file in the project and prints a warning and an optional continue prompt.
 *
 * **Only checks** in the current working directory because it's being executed at the beginning of the script.
 *
 * @export
 */
export async function checkLegacyConfig(
  cwd: string = process.cwd(),
  shouldPrompt: boolean = true
) {
  const legacyFilePath = path.resolve(cwd, '.twilio-functions');
  if (fileExistsSync(legacyFilePath)) {
    printConfigWarning();
    if (shouldPrompt) {
      return promptForContinue();
    } else {
      return true;
    }
  } else {
    return true;
  }
}

export default checkLegacyConfig;
