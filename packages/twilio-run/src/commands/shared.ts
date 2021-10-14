export type ExternalCliOptions = {
  username: string;
  password: string;
  accountSid?: string;
  profile?: string;
  project?: string;
  logLevel?: string;
  outputFormat?: string;
  pluginInfo?: {
    name: string;
    version: string;
  };
};

export type OutputFormat = string | undefined;
