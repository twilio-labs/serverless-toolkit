/** @module @twilio-labs/serverless-api/dist/api */

import { PackageJson } from 'type-fest';
import { Dependency } from '../types';

/**
 * Creates a list of dependencies compatible with the Serverless API givn a package.json file
 *
 * @export
 * @param {PackageJson} pkgJson an object structured like a package.json
 * @returns {Dependency[]}
 */
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
