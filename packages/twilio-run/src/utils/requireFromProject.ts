import { createRequire } from 'module';
import { join } from 'path';

export function requireFromProject(projectDir: string, packageName: string) {
  return createRequire(join(projectDir, 'node_modules'))(packageName);
}
