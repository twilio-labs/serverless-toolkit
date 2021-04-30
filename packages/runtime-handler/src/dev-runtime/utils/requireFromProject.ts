import { createRequire } from 'module';
import { join } from 'path';

export function requireFromProject(baseDir: string, packageName: string) {
  return createRequire(join(baseDir, 'node_modules'))(packageName);
}
