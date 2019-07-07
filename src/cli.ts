import yargs from 'yargs';

import * as StartCommand from './commands/start';
import * as NewCommand from './commands/new';
import * as DeployCommand from './commands/deploy';
import * as ListCommand from './commands/list';
import * as ActivateCommand from './commands/activate';

export async function run(rawArgs) {
  yargs
    .command(NewCommand)
    .command(DeployCommand)
    .command(ListCommand)
    .command(ActivateCommand)
    .command(StartCommand)
    .parse(rawArgs.slice(2));
}
