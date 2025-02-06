import chalk from 'chalk';
import columnify from 'columnify';
import isCi from 'is-ci';
import size from 'window-size';
import wrapAnsi from 'wrap-ansi';

export const windowSize = size || { width: 80, height: 300 };
export const shouldPrettyPrint = process.stdout.isTTY && !isCi;
export const supportsEmoji =
  process.platform !== 'win32' || isCi || process.env.TERM === 'xterm-256color';

export function getTwilioConsoleDeploymentUrl(
  serviceSid: string,
  environmentSid: string,
  region = 'us1'
) {
  return `https://console.twilio.com/${region}/develop/functions/editor/${serviceSid}/environment/${environmentSid}`;
}

export function printObjectWithoutHeaders(obj: {}): string {
  return columnify(obj, { showHeaders: false });
}

export function terminalLink(name: string, link: string): string {
  return chalk`${name} {dim | ${link}}`;
}

export function borderLeft(text: string, color: string): string {
  return text
    .split('\n')
    .map((str) => `${chalk.keyword(color)('│')} ${str}`)
    .join('\n');
}

const wrapText = (text: string) =>
  wrapAnsi(text, windowSize.width - 5, { trim: false });

export function importantMessage(
  label: string,
  color: string,
  title: string,
  body: string
) {
  label = chalk.keyword(color)(label);
  title = wrapText(chalk.bold.underline(`${label} ${chalk.bold(title)}`));
  body = wrapText(body);

  return '\n' + borderLeft(`${title}\n\n${chalk.dim(body)}`, color) + '\n';
}

export function warningMessage(title: string, body: string) {
  return importantMessage('WARNING', 'yellow', title, body);
}

export function errorMessage(title: string, body: string) {
  return importantMessage('ERROR', 'red', title, body);
}

export function redactPartOfString(
  input: string,
  paddingFront: number = 4
): string {
  const unredacted = input.substr(0, paddingFront);
  const redactedLength = input.length - paddingFront;
  const redactedStars = '*'.repeat(redactedLength);
  return unredacted + redactedStars;
}
