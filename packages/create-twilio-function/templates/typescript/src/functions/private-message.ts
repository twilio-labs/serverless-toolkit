// Imports global types
import '@twilio-labs/serverless-runtime-types';
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from '@twilio-labs/serverless-runtime-types/types';

export const handler: ServerlessFunctionSignature = function(
  context: Context,
  event: {},
  callback: ServerlessCallback
) {
  const assets = Runtime.getAssets();
  // After compiling the assets, the result will be "message.js" not a TypeScript file.
  const privateMessageAsset = assets['/message.js'];
  const privateMessagePath = privateMessageAsset.path;
  const message = require(privateMessagePath);
  const twiml = new Twilio.twiml.MessagingResponse();
  twiml.message(message.privateMessage());
  callback(null, twiml);
};