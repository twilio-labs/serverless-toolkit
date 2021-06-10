import { join } from 'path';
import { getDebugFunction } from '../utils/logger';
const debug = getDebugFunction('twilio-run:requireFromProject');

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
      debug(
        'Falling back to regular module resolution for package "%s"',
        packageName
      );
      return require(packageName);
    } else {
      throw err;
    }
  }
}
