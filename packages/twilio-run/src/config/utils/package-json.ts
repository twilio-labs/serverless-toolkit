import path from 'path';
import { PackageJson } from 'type-fest';
import { SharedFlags } from '../../flags';
import { fileExists, readFile } from '../../utils/fs';

export async function readPackageJsonContent({
  cwd,
}: SharedFlags): Promise<PackageJson> {
  if (!cwd) {
    throw new Error('Missing cwd to find package.json');
  }

  const pkgJsonPath = path.join(cwd, 'package.json');
  if (!(await fileExists(pkgJsonPath))) {
    throw new Error(`Failed to find package.json file at "${pkgJsonPath}"`);
  }

  const pkgContent = await readFile(pkgJsonPath, 'utf8');
  const pkgJson: PackageJson = JSON.parse(pkgContent);
  return pkgJson;
}
