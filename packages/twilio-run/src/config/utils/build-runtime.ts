import { BuildRuntime, availableRuntimes } from '@twilio-labs/serverless-api';

export const isBuildRuntime = (runtime?: string): runtime is BuildRuntime => {
  return (
    typeof runtime === 'string' && availableRuntimes.some(r => r === runtime)
  );
};
