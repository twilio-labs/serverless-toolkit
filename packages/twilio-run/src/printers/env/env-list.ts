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
      .map((entry) => {
        return chalk`{bold ${entry.key}} {dim ${entry.value}}`;
      })
      .join('\n');
    writeOutput(output);
  }
}
