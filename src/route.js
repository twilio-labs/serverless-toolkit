const twilio = require('twilio');
const {
  VoiceResponse,
  MessagingResponse,
  FaxResponse
} = require('twilio').twiml;
const { Response } = require('./internal/response');
const Runtime = require('./internal/runtime');

function constructEvent(req) {
  return { ...req.query, ...req.body };
}

function constructContext(config) {
  function getTwilioClient() {
    return twilio();
  }
  const DOMAIN_NAME = config.url;
  return { ...process.env, DOMAIN_NAME, getTwilioClient };
}

function constructGlobalScope() {
  global['Twilio'] = { ...twilio, Response };
  global['Runtime'] = Runtime;
}

function handleError(err, res) {
  if (typeof err === 'string') {
    res.status(500).send(err);
    return;
  }
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
    res.send(responseObject);
    return;
  }

  if (isTwiml(responseObject)) {
    res.type('text/xml').send(responseObject.toString());
    return;
  }

  if (responseObject instanceof Response) {
    responseObject.applyToExpressResponse(res);
    return;
  }

  res.send(responseObject);
}

function functionToRoute(fn, config) {
  constructGlobalScope();

  return function twilioFunctionHandler(req, res) {
    const event = constructEvent(req);
    const context = constructContext(config);

    function callback(err, responseObject) {
      if (err) {
        handleError(err, res);
        return;
      }
      handleSuccess(responseObject, res);
    }

    fn(context, event, callback);
  };
}

module.exports = { functionToRoute };
