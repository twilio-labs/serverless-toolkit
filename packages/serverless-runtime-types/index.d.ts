import * as twilio from 'twilio';
import {
  GlobalTwilio,
  ResourceMap,
  ResponseConstructor,
  RuntimeInstance,
} from './types';

declare global {
  var Twilio: GlobalTwilio;
  var Runtime: RuntimeInstance;
  var Functions: ResourceMap;
  var twilioClient: null | twilio.Twilio;

  namespace NodeJS {
    interface Global {
      Twilio: GlobalTwilio;
      Runtime: RuntimeInstance;
      Functions: ResourceMap;
      Response: ResponseConstructor;
      twilioClient: null | twilio.Twilio;
    }
  }
}
