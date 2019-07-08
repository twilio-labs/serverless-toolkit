import { RuntimeInstance, TwilioResponse, GlobalTwilio } from './types';

declare global {
  var Twilio: GlobalTwilio;
  var Runtime: RuntimeInstance;

  namespace NodeJS {
    interface Global {
      Twilio: GlobalTwilio;
      Runtime: RuntimeInstance;
    }
  }
}
