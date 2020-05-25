// Imports global types
import '@twilio-labs/serverless-runtime-types';
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from '@twilio-labs/serverless-runtime-types/types';

type MyEvent = {
  Body?: string
}

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
type MyContext = {
  GREETING?: string
}

export const handler: ServerlessFunctionSignature = function(
  context: Context<MyContext>,
  event: MyEvent,
  callback: ServerlessCallback
) {
  const twiml = new Twilio.twiml.VoiceResponse();
  twiml.say(`${context.GREETING ? context.GREETING : 'Hello'} ${event.Body ? event.Body : 'World'}!`);
  callback(null, twiml);
};