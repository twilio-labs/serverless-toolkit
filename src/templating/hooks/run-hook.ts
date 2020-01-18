import * as Twilio from 'twilio';
import { NodeVM, VMScript } from 'vm2';
import { EnvironmentVariablesWithAuth } from '../../types/generic';
import { getDebugFunction, ILogger } from '../../utils/logger';
import { HookError } from './HookError';

const debug = getDebugFunction('twilio-run:templating:hooks:run');

export async function runHook(
  hookName: string,
  rawScript: string,
  env: EnvironmentVariablesWithAuth,
  logger: Console | ILogger
) {
  const vm = new NodeVM({
    console: 'off',
    sandbox: {
      Twilio: Twilio,
      console: logger,
      process: {
        env: env,
      },
    },
    require: {
      external: false,
      builtin: [],
      root: process.cwd(),
    },
  });
  const client = new Twilio.Twilio(
    process.env.TWILIO_ACCOUNT_SID || '',
    process.env.TWILIO_AUTH_TOKEN || ''
  );
  const script = new VMScript(rawScript);
  const { [hookName]: hookFunction } = vm.run(script);

  try {
    const output = await hookFunction(client, env);
    return output;
  } catch (err) {
    debug('%O', err);
    throw new HookError(
      'Hook failed running. Please file an issue at github.com/twilio-labs/function-templates'
    );
  }
}
