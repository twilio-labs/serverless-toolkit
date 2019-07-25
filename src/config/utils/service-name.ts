import debug from 'debug';
import { SharedFlags } from '../../commands/shared';
import { deprecateProjectName } from '../../commands/utils';
import { readPackageJsonContent } from './package-json';

const log = debug('twilio-run:config:utils');

type FlagsWithServiceName = SharedFlags & {
  serviceName?: string;
  projectName?: string;
};

export async function getServiceNameFromFlags<T extends FlagsWithServiceName>(
  flags: T
): Promise<string | undefined> {
  let { serviceName, cwd } = flags;

  if (typeof flags.projectName !== 'undefined') {
    deprecateProjectName();
    if (!serviceName) {
      serviceName = flags.projectName;
    }
  }

  if (!serviceName && cwd) {
    try {
      const pkgJson = await readPackageJsonContent(flags);
      if (typeof pkgJson.name === 'string') {
        serviceName = pkgJson.name;
      }
    } catch (err) {
      log('%O', err);
    }
  }

  return serviceName;
}
