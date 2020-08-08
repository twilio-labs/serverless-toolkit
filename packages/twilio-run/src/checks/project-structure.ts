import { fsHelpers } from '@twilio-labs/serverless-api';
import chalk from 'chalk';
import { commaListsOr, stripIndent } from 'common-tags';
import { logger } from '../utils/logger';

export async function doesAnyDirectoryExist(
  basePath: string,
  directories: string[]
): Promise<boolean> {
  let foundDirectories: string | undefined;
  try {
    foundDirectories = fsHelpers.getFirstMatchingDirectory(
      basePath,
      directories
    );
  } catch {
    foundDirectories = undefined;
  }

  if (typeof foundDirectories !== 'undefined') {
    return true;
  }

  return false;
}

export default async function checkProjectStructure(
  basePath: string,
  command: string,
  shouldExit: boolean = false,
  directories: {
    assetsDirectories?: string[];
    functionsDirectories?: string[];
  } = {}
): Promise<void> {
  const allDirectories = [
    ...(directories.functionsDirectories || ['functions', 'src']),
    ...(directories.assetsDirectories || ['assets', 'static']),
  ];
  if (await doesAnyDirectoryExist(basePath, allDirectories)) {
    return;
  }

  let initializationCommand = 'npx create-twilio-function';
  if (command.includes(':')) {
    initializationCommand = command.substr(0, command.indexOf(':')) + ':init';
  }

  const quotedDirectories = allDirectories.map(dir => `"${dir}"`);
  const messageBody = stripIndent`
    We could not find any of the following directories ${commaListsOr`${quotedDirectories}`} in "${basePath}".
    
    ${chalk.bold(`What's a Serverless project?`)}
    The easiest way to start a Serverless project is by running:
      > ${initializationCommand} example-project
      > cd example-project

    ${chalk.bold('I got an existing Serverless project')}
    If you have an existing Serverless project, make sure to change into the root directory. Alternatively you can use the "--cwd" flag to specify the directory of your choice.
  `;
  const title = 'Invalid Serverless Project Structure';

  if (shouldExit) {
    logger.error(messageBody, title);
    process.exit(1);
  } else {
    logger.warn(messageBody, title);
  }
}
