import yargs from 'yargs';
import * as DeployCommand from './commands/deploy';
import EnvCommands from './commands/env';
import * as ListCommand from './commands/list';
import * as ListTemplatesCommand from './commands/list-templates';
import * as LogsCommand from './commands/logs';
import * as NewCommand from './commands/new';
import * as ActivateCommand from './commands/promote';
import * as StartCommand from './commands/start';

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
        yargs.command(EnvCommands.GetCommand);
        yargs.command(EnvCommands.ListCommand);
        yargs.command(EnvCommands.UnsetCommand);
      }
    )
    .parse(rawArgs.slice(2));
}
