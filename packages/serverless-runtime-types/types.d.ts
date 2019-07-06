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
