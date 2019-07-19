import * as twilio from 'twilio';
import { SyncListListInstance } from 'twilio/lib/rest/preview/sync/service/syncList';
import { ServiceContext } from 'twilio/lib/rest/sync/v1/service';
import { SyncMapListInstance } from 'twilio/lib/rest/sync/v1/service/syncMap';
import { TwilioClientOptions } from 'twilio/lib/rest/Twilio';

export type EnvironmentVariables = {
  [key: string]: string | undefined;
};

export type ResourceMap = {
  [name: string]: {
    path: string;
  };
};

export type AssetResourceMap = {
  [name: string]: {
    path: string;
    open(): string;
  };
};

export interface TwilioResponse {
  setStatusCode(code: number): void;
  setBody(body: string | object): void;
  appendHeader(key: string, value: string): void;
  setHeaders(headers: { [key: string]: string }): void;
}

export type RuntimeSyncClientOptions = TwilioClientOptions & {
  serviceName?: string;
};

export type RuntimeSyncServiceContext = ServiceContext & {
  maps: SyncMapListInstance;
  lists: SyncListListInstance;
};

export type RuntimeInstance = {
  getAssets(): AssetResourceMap;
  getFunctions(): ResourceMap;
  getSync(options?: RuntimeSyncClientOptions): RuntimeSyncServiceContext;
};

export type Context<T = {}> = {
  getTwilioClient(): twilio.Twilio;
  DOMAIN_NAME: string;
} & T;

export type ServerlessCallback = (
  error: null | Error,
  payload?: object
) => void;

export type ServerlessFunctionSignature<
  T extends EnvironmentVariables = {},
  U extends {} = {}
> = (
  context: Context<T>,
  event: U,
  callback: ServerlessCallback
) => void | Promise<void>;

export type ResponseConstructor = new (...args: any[]) => TwilioResponse;
export type GlobalTwilio = Omit<typeof twilio, 'default'> & {
  Response: ResponseConstructor;
};
