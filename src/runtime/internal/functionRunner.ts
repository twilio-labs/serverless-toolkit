import { getDebugFunction } from '../../utils/logger';
import { isTwiml } from '../route';
import { Response } from './response';
import { serializeError } from 'serialize-error';
import { ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { constructGlobalScope } from '../route';
import { checkForValidAccountSid } from '../../checks/check-account-sid';
import twilio from 'twilio';

const debug = getDebugFunction('twilio-run:route');

export type Reply = {
  body?: string | number | boolean | object;
  headers?: { [key: string]: number | string };
  statusCode: number;
};

const callback: ServerlessCallback = (err, responseObject) => {
  if (err) {
    if (process.send) {
      process.send({ err: serializeError(err) });
    }
    return;
  }
  let reply: Reply = { statusCode: 200 };
  if (typeof responseObject === 'string') {
    debug('Sending basic string response');
    reply.headers = { 'Content-Type': 'text/plain' };
    reply.body = responseObject;
    if (process.send) {
      process.send({ reply });
    }
    return;
  }

  if (
    responseObject &&
    typeof responseObject === 'object' &&
    isTwiml(responseObject)
  ) {
    debug('Sending TwiML response as XML string');
    reply.headers = { 'Content-Type': 'text/xml' };
    reply.body = responseObject.toString();
    if (process.send) {
      process.send({ reply });
    }
    return;
  }

  if (responseObject && responseObject instanceof Response) {
    debug('Sending custom response');
    reply = responseObject.serialize();
    if (process.send) {
      process.send({ reply });
    }
    return;
  }

  debug('Sending JSON response');
  reply.body = responseObject;
  reply.headers = { 'Content-Type': 'application/json' };
  if (process.send) {
    process.send({ reply });
  }
  return;
};

process.on('message', ({ functionPath, context, event, config }) => {
  const { handler } = require(functionPath);
  try {
    constructGlobalScope(config);
    context.getTwilioClient = function(): twilio.Twilio {
      checkForValidAccountSid(context.ACCOUNT_SID, {
        shouldPrintMessage: true,
        shouldThrowError: true,
        functionName: 'context.getTwilioClient()',
      });
      return twilio(context.ACCOUNT_SID, context.AUTH_TOKEN);
    };
    handler(context, event, callback);
  } catch (err) {
    if (process.send) {
      process.send({ err: serializeError(err) });
    }
  }
});
