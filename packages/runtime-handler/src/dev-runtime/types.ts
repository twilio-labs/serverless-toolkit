export type EnvironmentVariablesWithAuth = {
  ACCOUNT_SID?: string;
  AUTH_TOKEN?: string;
  [key: string]: string | undefined;
};

export type InspectInfo = {
  hostPort: string;
  break: boolean;
};

export type AccessOptions = 'private' | 'protected' | 'public';

/**
 * Necessary info to deploy a function
 */
export type ServerlessResourceConfig = {
  /**
   * Access for the function
   */
  access: AccessOptions;
  /**
   * Content of the uploaded function
   */
  content: string | Buffer;
  /**
   * Function name
   */
  name: string;
  /**
   * Path for the serverless resource
   * Functions: '/some-function'
   * Assets: '/some-assets.jpg'
   */
  path: string;
};

export type ServerlessResourceConfigWithFilePath = ServerlessResourceConfig & {
  /**
   * Path to the actual file on the file system.
   */
  filePath: string;
};

export type RouteInfo = {
  functions: ServerlessResourceConfigWithFilePath[];
  assets: ServerlessResourceConfigWithFilePath[];
};

export type ServerConfig = {
  inspect?: InspectInfo;
  baseDir: string;
  env: EnvironmentVariablesWithAuth;
  port: number;
  url: string;
  detailedLogs: boolean;
  live: boolean;
  logs: boolean;
  legacyMode: boolean;
  appName: string;
  forkProcess: boolean;
  logger?: LoggerInstance;
  routes: RouteInfo;
  enableDebugLogs: boolean;
};

export type LoggerInstance = {
  debug(msg: string): void;
  info(msg: string): void;
  warn(msg: string, title?: string): void;
  error(msg: string, title?: string): void;
  log(msg: string, level: number): void;
};

export type HeaderValue = number | string | (string | number)[];
export type Headers = {
  [key: string]: HeaderValue;
};
