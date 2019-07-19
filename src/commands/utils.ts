import { basename } from 'path';
import util from 'util';
import { Arguments } from 'yargs';

export const deprecateProjectName = util.deprecate(() => {},
'--project-name is deprecated. Please use --service-name instead. If both have been passed --service-name will be preferred.');

export function getFullCommand(flags: Arguments<{}>): string {
  let baseCommand = flags.$0;
  baseCommand = basename(baseCommand);
  if (flags._.length > 0) {
    baseCommand = `${baseCommand} ${flags._[0]}`;
  }
  return baseCommand;
}
