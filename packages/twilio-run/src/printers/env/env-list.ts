import { GetEnvironmentVariablesResult } from '@twilio-labs/serverless-api';
import chalk from 'chalk';
import { writeJSONOutput, writeOutput } from '../../utils/output';

export function outputVariables(
  result: GetEnvironmentVariablesResult,
  format?: 'json'
) {
  if (format === 'json') {
    writeJSONOutput(result);
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
