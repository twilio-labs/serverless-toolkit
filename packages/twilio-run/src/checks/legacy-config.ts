import { stripIndent } from 'common-tags';
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

/**
 * This function checks if there is a .twilio-functions file in the project and prints a warning.
 *
 * **Only checks** in the current working directory because it's being executed at the beginning of the script.
 *
 * @export
 */
export function checkLegacyConfig() {
  const legacyFilePath = path.resolve(process.cwd(), '.twilio-functions');
  if (fileExistsSync(legacyFilePath)) {
    printConfigWarning();
  }
}

export default checkLegacyConfig;
