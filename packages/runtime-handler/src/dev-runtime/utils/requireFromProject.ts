import { createRequire } from 'module';

export function requireFromProject(baseDir: string, packageName: string) {
  return createRequire(baseDir)(packageName);
}
