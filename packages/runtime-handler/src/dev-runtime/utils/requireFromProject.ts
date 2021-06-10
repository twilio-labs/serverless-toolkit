import { join } from 'path';
import debug from '../utils/debug';

const log = debug('twilio-runtime-handler:dev:requireFromProject');

export function requireFromProject(
  baseDir: string,
  packageName: string,
  fallbackToBuiltIn: boolean = false
) {
  try {
    const lookupLocation = join(baseDir, 'node_modules');
    const moduleLocation = require.resolve(packageName, {
      paths: [lookupLocation],
    });
    return require(moduleLocation);
  } catch (err) {
    if (fallbackToBuiltIn) {
      log(
        'Falling back to regular module resolution for package "%s"',
        packageName
      );
      return require(packageName);
    } else {
      throw err;
    }
  }
}
