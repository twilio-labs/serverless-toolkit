import kebabCase from 'lodash.kebabcase';
import { CliInfo } from '../../commands/types';
import { AllAvailableFlagTypes, SharedFlagNames } from '../../flags';

export function mergeFlagsAndConfig<
  T extends Pick<AllAvailableFlagTypes, SharedFlagNames> & {
    [key: string]: any;
  }
>(config: Partial<T>, flags: T, cliInfo: CliInfo): T {
  const mergedResult = Object.keys(flags).reduce(
    (result: T, key: string) => {
      let value = flags[key];
      const opt = cliInfo.options[kebabCase(key)];
      const arg = cliInfo.argsDefaults && cliInfo.argsDefaults[kebabCase(key)];
      if ((opt && opt.default === value) || arg) {
        if (typeof config[key] !== 'undefined') {
          value = config[key];
        }
      }
      return { ...result, [key]: value };
    },
    { ...(config as T) }
  );
  if (
    typeof config.cwd === 'string' &&
    config.cwd !== process.cwd() &&
    flags.cwd === process.cwd()
  ) {
    mergedResult.cwd = config.cwd;
  }
  return mergedResult;
}
