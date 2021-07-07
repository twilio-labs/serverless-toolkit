import os from 'os';
import pkgJson from './package-info';

export function getUserAgent(extensions: string[] = []) {
  const name = pkgJson.name || '@twilio-labs/serverless-api';
  const version = pkgJson.version || '0.0.0';
  const osName = os.platform() || 'unknown';
  const osArch = os.arch() || 'unknown';
  const nodeVersion = process.version || '0.0.0';
  const extensionString =
    extensions.length > 0 ? ' ' + extensions.join(' ') : '';
  return `${name}/${version} (${osName} ${osArch}) node/${nodeVersion}${extensionString}`;
}

export default getUserAgent;
