/// <reference path="../../node_modules/@twilio-labs/serverless-runtime-types/index.d.ts"/>

/**
 * @param {import('@twilio-labs/serverless-runtime-types').Context} context
 * @param {import('@twilio-labs/serverless-runtime-types').ServerlessEventObject<{}, {}, { token: string }>} event
 * @param {import('@twilio-labs/serverless-runtime-types').ServerlessCallback} callback
 */
exports.handler = function (context, event, callback) {
  let twiml = new Twilio.twiml.MessagingResponse();
  console.log(event.cookies.token);
  twiml.message('Hello World');
  callback(null, twiml);
};
