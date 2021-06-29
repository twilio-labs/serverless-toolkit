import os from 'os';
import pkgJson from './package-info';

let extensions: string[] = [];

export function getUserAgent() {
  const name = pkgJson.name || '@twilio-labs/serverless-api';
  const version = pkgJson.version || '0.0.0';
  const osName = os.platform() || 'unknown';
  const osArch = os.arch() || 'unknown';
  const extensionString =
    extensions.length > 0 ? ' ' + extensions.join(' ') : '';
  return `${name}/${version} (${osName} ${osArch})${extensionString}`;
}

export function _resetUserAgentExtensions() {
  extensions = [];
}

export function _addCustomUserAgentExtension(extensionName: string) {
  extensions = [...extensions, extensionName];
}

export default getUserAgent;
