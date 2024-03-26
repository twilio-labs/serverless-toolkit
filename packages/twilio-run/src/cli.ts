import yargs from 'yargs';
import * as DeployCommand from './commands/deploy';
import EnvCommands from './commands/env';
import * as ListCommand from './commands/list';
import * as ListTemplatesCommand from './commands/list-templates';
import * as LogsCommand from './commands/logs';
import * as NewCommand from './commands/new';
import * as ActivateCommand from './commands/promote';
import * as StartCommand from './commands/start';
import { EnvGetFlags } from './config/env/env-get';
import { EnvImportFlags } from './config/env/env-import';
import { EnvListFlags } from './config/env/env-list';
import { EnvSetFlags } from './config/env/env-set';
import { EnvUnsetFlags } from './config/env/env-unset';

export async function run(rawArgs: string[]) {
  yargs
    .command(StartCommand)
    .command(NewCommand)
    .command(ListTemplatesCommand)
    .command(DeployCommand)
    .command(ListCommand)
    .command(ActivateCommand)
    .command(LogsCommand)
    .command(
      'env',
      'Retrieve and modify the environment variables for your deployment',
      (yargs) => {
        yargs.command<EnvGetFlags>(EnvCommands.GetCommand);
        yargs.command<EnvSetFlags>(EnvCommands.SetCommand);
        yargs.command<EnvListFlags>(EnvCommands.ListCommand);
        yargs.command<EnvUnsetFlags>(EnvCommands.UnsetCommand);
        yargs.command<EnvImportFlags>(EnvCommands.ImportCommand);
      }
    )
    .parse(rawArgs.slice(2));
}
