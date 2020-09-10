import yargs from 'yargs';
import * as ActivateCommand from './commands/activate';
import * as DeployCommand from './commands/deploy';
import * as ListCommand from './commands/list';
import * as NewCommand from './commands/new';
import * as StartCommand from './commands/start';
import * as ListTemplatesCommand from './commands/list-templates';
import * as LogsCommand from './commands/logs';

export async function run(rawArgs: string[]) {
  yargs
    .command(StartCommand)
    .command(NewCommand)
    .command(ListTemplatesCommand)
    .command(DeployCommand)
    .command(ListCommand)
    .command(ActivateCommand)
    .command(LogsCommand)
    .parse(rawArgs.slice(2));
}
