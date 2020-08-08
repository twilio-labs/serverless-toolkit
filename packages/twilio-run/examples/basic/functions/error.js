/// <reference path="../../../node_modules/@twilio-labs/serverless-runtime-types/index.d.ts"/>

exports.handler = function(context, event, callback) {
  const err = new Error('Something went wrong');
  err.name = 'WebhookError';
  callback(err);
};
