import { stripIndent } from 'common-tags';
import { coerce as semverCoerce, parse as semverParse } from 'semver';
import { PackageJson } from 'type-fest';
import { logger } from '../utils/logger';

export function isExactSemVerVersion(version?: string): boolean {
  return semverParse(version) !== null;
}

export function checkForValidRuntimeHandlerVersion(
  packageJson: PackageJson,
  shouldFailIfMissing = false
): boolean {
  const runtimeHandlerVersion =
    packageJson.dependencies?.['@twilio/runtime-handler'];

  let title: string | undefined;
  let message: string;

  if (typeof runtimeHandlerVersion !== 'string') {
    if (packageJson.devDependencies?.['@twilio/runtime-handler']) {
      title = 'Wrongly configured @twilio/runtime-handler declaration';

      message = stripIndent`
      You defined the @twilio/runtime-handler dependency inside the "devDependencies" field of your package.json.

      The @twilio/runtime-handler has to be defined in the "dependencies" field instead to be passed to Twilio Functions.
    `;
    } else if (shouldFailIfMissing) {
      title = 'Missing @twilio/runtime-handler declaration';
      message = stripIndent`
        We could not find a specific @twilio/runtime-handler version in your package.json "dependencies" field.

        The @twilio/runtime-handler defines which features inside your Twilio Functions environment should be available.

        Please add one manually or run the following inside your project to install the latest version of the @twilio/runtime-handler:

        npm install @twilio/runtime-handler --save-exact
      `;
    } else {
      return true;
    }
  } else if (isExactSemVerVersion(runtimeHandlerVersion)) {
    return true;
  } else {
    title = 'Invalid @twilio/runtime-handler version';
    message = stripIndent`
      The @twilio/runtime-handler version has to be an exact valid semver version.
      Please update the "dependencies" field in your package.json accordingly.

      Received:
        "@twilio/runtime-handler": "${runtimeHandlerVersion}",
      Expected Format:
        "@twilio/runtime-handler": "${
          semverCoerce(runtimeHandlerVersion) || '1.1.0'
        }",
    `;
  }

  if (message) {
    logger.error(message, title);
  }

  return false;
}
