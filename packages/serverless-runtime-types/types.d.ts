import twilio from 'twilio';
import { ServiceContext } from 'twilio/lib/rest/sync/v1/service';

export type EnvironmentVariables = {
  [key: string]: string | undefined;
};

export type ResourceMap = {
  [name: string]: {
    path: string;
  };
};

export type RuntimeInstance = {
  getAssets(): ResourceMap;
  getFunctions(): ResourceMap;
  getSync(config?: { serviceName: string }): ServiceContext;
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
