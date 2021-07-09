import fs from 'fs';
import path from 'path';
import { ExternalCliOptions } from '../../commands/shared';

const pkgJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../package.json'), 'utf8')
);

export function getUserAgentExtensions(
  command: string,
  externalCliOptions?: ExternalCliOptions
) {
  const extensions = [`twilio-run/${pkgJson.version || '0.0.0'}`];

  if (typeof externalCliOptions?.pluginInfo !== 'undefined') {
    const { name, version } = externalCliOptions.pluginInfo;
    extensions.push(`${name}/${version}`);
  }

  extensions.push(`twilio-run:${command}`);

  return extensions;
}
