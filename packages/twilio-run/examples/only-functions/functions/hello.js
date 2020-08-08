/// <reference path="../../../node_modules/@twilio-labs/serverless-runtime-types/index.d.ts"/>

exports.handler = function(context, event, callback) {
  let twiml = new Twilio.twiml.MessagingResponse();
  twiml.message('Hello World');
  callback(null, twiml);
};
