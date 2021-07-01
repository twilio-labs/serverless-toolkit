import { GetEnvironmentVariablesResult } from '@twilio-labs/serverless-api';
import chalk from 'chalk';
import { writeOutput } from '../../utils/output';

export function outputVariables(
  result: GetEnvironmentVariablesResult,
  format?: 'json'
) {
  if (format === 'json') {
    writeOutput(JSON.stringify(result, null, '\t'));
  } else {
    const output = result.variables
      .map((entry: { [key: string]: string | undefined }) => {
        const key = chalk`{bold ${entry.key}}`;
        const value =
          typeof entry.value !== 'undefined'
            ? entry.value
            : chalk`{dim Use --show-values to display value}`;
        return `${key} ${value}`;
      })
      .join('\n');
    writeOutput(output);
  }
}
