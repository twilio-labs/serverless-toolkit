import { PackageJson } from 'type-fest';
import { Dependency } from '../types';

export function getDependencies(pkgJson: PackageJson): Dependency[] {
  const dependencies = pkgJson.dependencies;
  if (!dependencies) {
    return [];
  }

  return Object.keys(dependencies).map(name => {
    const version = dependencies[name];
    if (!dependencies[name]) {
      return {
        name,
        version: '*',
      };
    }

    return {
      name,
      version: dependencies[name],
    };
  });
}
