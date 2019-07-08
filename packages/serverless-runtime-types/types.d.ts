import twilio from 'twilio';
import { ServiceContext } from 'twilio/lib/rest/sync/v1/service';

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
