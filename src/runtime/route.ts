import twilio, { twiml } from 'twilio';
import debug from 'debug';

import { Response } from './internal/response';
import * as Runtime from './internal/runtime';

const { VoiceResponse, MessagingResponse, FaxResponse } = twiml;

const log = debug('twilio-run:route');

export function constructEvent(req) {
  return { ...req.query, ...req.body };
}

export function constructContext({ url, env }) {
  function getTwilioClient() {
    return twilio(env.ACCOUNT_SID, env.AUTH_TOKEN);
  }
  const DOMAIN_NAME = url.replace(/^https?:\/\//, '');
  return { ...env, DOMAIN_NAME, getTwilioClient };
}

export function constructGlobalScope(config) {
  global['Twilio'] = { ...twilio, Response };
  global['Runtime'] = Runtime.create(config);
}

export function handleError(err, res) {
  res.status(500);
  res.send(err.stack);
}

export function isTwiml(obj) {
  const isVoiceTwiml = obj instanceof VoiceResponse;
  const isMessagingTwiml = obj instanceof MessagingResponse;
  const isFaxTwiml = obj instanceof FaxResponse;
  return isVoiceTwiml || isMessagingTwiml || isFaxTwiml;
}

export function handleSuccess(responseObject, res) {
  res.status(200);
  if (typeof responseObject === 'string') {
    log('Sending basic string response');
    res.send(responseObject);
    return;
  }

  if (isTwiml(responseObject)) {
    log('Sending TwiML response as XML string');
    res.type('text/xml').send(responseObject.toString());
    return;
  }

  if (responseObject instanceof Response) {
    log('Sending custom response');
    responseObject.applyToExpressResponse(res);
    return;
  }

  log('Sending JSON response');
  res.send(responseObject);
}

export function functionToRoute(fn, config) {
  constructGlobalScope(config);

  return function twilioFunctionHandler(req, res) {
    const event = constructEvent(req);
    log('Event for %s: %o', req.path, event);
    const context = constructContext(config);
    log('Context for %s: %o', req.path, context);

    function callback(err, responseObject?) {
      log('Function execution %s finished', req.path);
      if (err) {
        handleError(err, res);
        return;
      }
      handleSuccess(responseObject, res);
    }

    log('Calling function for %s', req.path);
    try {
      fn(context, event, callback);
    } catch (err) {
      callback(err.message);
    }
  };
}
