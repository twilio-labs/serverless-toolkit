import isCi from 'is-ci';
import columnify from 'columnify';
import chalk from 'chalk';

export const shouldPrettyPrint = process.stdout.isTTY && !isCi;
export const supportsEmoji =
  process.platform !== 'win32' || isCi || process.env.TERM === 'xterm-256color';

export function printObjectWithoutHeaders(obj) {
  return columnify(obj, { showHeaders: false });
}

export function terminalLink(name, link) {
  return chalk`${name} {dim | ${link}}`;
}
