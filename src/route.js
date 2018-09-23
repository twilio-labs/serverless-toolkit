const twilio = require('twilio');
const {
  VoiceResponse,
  MessagingResponse,
  FaxResponse,
} = require('twilio').twiml;
const debug = require('debug')('twilio-run:route');

const { Response } = require('./internal/response');
const Runtime = require('./internal/runtime');

function constructEvent(req) {
  return { ...req.query, ...req.body };
}

function constructContext({ url, env }) {
  function getTwilioClient() {
    return twilio(env.ACCOUNT_SID, env.AUTH_TOKEN);
  }
  const DOMAIN_NAME = url.replace(/^https?:\/\//, '');
  return { ...env, DOMAIN_NAME, getTwilioClient };
}

function constructGlobalScope() {
  global['Twilio'] = { ...twilio, Response };
  global['Runtime'] = Runtime;
}

function handleError(err, res) {
  res.status(500);
  res.send(err);
}

function isTwiml(obj) {
  const isVoiceTwiml = obj instanceof VoiceResponse;
  const isMessagingTwiml = obj instanceof MessagingResponse;
  const isFaxTwiml = obj instanceof FaxResponse;
  return isVoiceTwiml || isMessagingTwiml || isFaxTwiml;
}

function handleSuccess(responseObject, res) {
  res.status(200);
  if (typeof responseObject === 'string') {
    debug('Sending basic string response');
    res.send(responseObject);
    return;
  }

  if (isTwiml(responseObject)) {
    debug('Sending TwiML response as XML string');
    res.type('text/xml').send(responseObject.toString());
    return;
  }

  if (responseObject instanceof Response) {
    debug('Sending custom response');
    responseObject.applyToExpressResponse(res);
    return;
  }

  debug('Sending JSON response');
  res.send(responseObject);
}

function functionToRoute(fn, config) {
  constructGlobalScope();

  return function twilioFunctionHandler(req, res) {
    const event = constructEvent(req);
    debug('Event for %s: %o', req.path, event);
    const context = constructContext(config);
    debug('Context for %s: %o', req.path, context);

    function callback(err, responseObject) {
      debug('Function execution %s finished', req.path);
      if (err) {
        handleError(err, res);
        return;
      }
      handleSuccess(responseObject, res);
    }

    debug('Calling function for %s', req.path);
    fn(context, event, callback);
  };
}

module.exports = {
  functionToRoute,
  constructEvent,
  constructContext,
  constructGlobalScope,
  handleError,
  handleSuccess,
  isTwiml,
};
