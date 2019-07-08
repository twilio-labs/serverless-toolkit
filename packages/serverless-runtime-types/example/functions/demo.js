/// <reference path="../../node_modules/@twilio-labs/serverless-runtime-types/index.d.ts"/>

/**
 * @param {import('@twilio-labs/serverless-runtime-types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types').ServerlessCallback} callback
 */
exports.handler = function(context, event, callback) {
  let twiml = new Twilio.twiml.MessagingResponse();
  twiml.message('Hello World');
  callback(null, twiml);
};
