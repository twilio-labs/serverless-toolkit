import TwilioLib = require('twilio');
import { RuntimeInstance } from './types';

declare global {
  var Twilio: typeof TwilioLib;
  var Runtime: RuntimeInstance;

  namespace NodeJS {
    interface Global {
      Twilio: typeof TwilioLib;
      Runtime: RuntimeInstance;
    }
  }
}
