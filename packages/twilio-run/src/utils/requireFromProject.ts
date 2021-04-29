import { createRequire } from 'module';

export function requireFromProject(projectDir: string, packageName: string) {
  return createRequire(projectDir)(packageName);
}
