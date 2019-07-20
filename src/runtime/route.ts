import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from '@twilio-labs/serverless-runtime-types/types';
import debug from 'debug';
import {
  NextFunction,
  Request as ExpressRequest,
  RequestHandler as ExpressRequestHandler,
  Response as ExpressResponse,
} from 'express';
import twilio, { twiml } from 'twilio';
import { StartCliConfig } from './cli/config';
import { Response } from './internal/response';
import * as Runtime from './internal/runtime';

const { VoiceResponse, MessagingResponse, FaxResponse } = twiml;

const log = debug('twilio-run:route');

export function constructEvent<T extends {} = {}>(req: ExpressRequest): T {
  return { ...req.query, ...req.body };
}

export function constructContext<T extends {} = {}>({
  url,
  env,
}: StartCliConfig): Context<{
  ACCOUNT_SID?: string;
  AUTH_TOKEN?: string;
  [key: string]: string | undefined | Function;
}> {
  function getTwilioClient(): twilio.Twilio {
    return twilio(env.ACCOUNT_SID, env.AUTH_TOKEN);
  }
  const DOMAIN_NAME = url.replace(/^https?:\/\//, '');
  return { ...env, DOMAIN_NAME, getTwilioClient };
}

export function constructGlobalScope(config: StartCliConfig): void {
  const GlobalRuntime = Runtime.create(config);
  (global as any)['Twilio'] = { ...twilio, Response };
  (global as any)['Runtime'] = GlobalRuntime;
  (global as any)['Functions'] = GlobalRuntime.getFunctions();
  (global as any)['Response'] = Response;

  if (config.env.ACCOUNT_SID && config.env.AUTH_TOKEN) {
    (global as any)['twilioClient'] = twilio(
      config.env.ACCOUNT_SID,
      config.env.AUTH_TOKEN
    );
  }
}

export function handleError(err: Error, res: ExpressResponse) {
  res.status(500);
  res.send(err.stack);
}

export function isTwiml(obj: object): boolean {
  const isVoiceTwiml = obj instanceof VoiceResponse;
  const isMessagingTwiml = obj instanceof MessagingResponse;
  const isFaxTwiml = obj instanceof FaxResponse;
  return isVoiceTwiml || isMessagingTwiml || isFaxTwiml;
}

export function handleSuccess(
  responseObject: string | object | undefined,
  res: ExpressResponse
) {
  res.status(200);
  if (typeof responseObject === 'string') {
    log('Sending basic string response');
    res.send(responseObject);
    return;
  }

  if (responseObject && isTwiml(responseObject)) {
    log('Sending TwiML response as XML string');
    res.type('text/xml').send(responseObject.toString());
    return;
  }

  if (responseObject && responseObject instanceof Response) {
    log('Sending custom response');
    responseObject.applyToExpressResponse(res);
    return;
  }

  log('Sending JSON response');
  res.send(responseObject);
}

export function functionToRoute(
  fn: ServerlessFunctionSignature,
  config: StartCliConfig
): ExpressRequestHandler {
  constructGlobalScope(config);

  return function twilioFunctionHandler(
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
  ) {
    const event = constructEvent(req);
    log('Event for %s: %o', req.path, event);
    const context = constructContext(config);
    log('Context for %s: %p', req.path, context);

    const callback: ServerlessCallback = function callback(
      err,
      responseObject?
    ) {
      log('Function execution %s finished', req.path);
      if (err) {
        handleError(err, res);
        return;
      }
      handleSuccess(responseObject, res);
    };

    log('Calling function for %s', req.path);
    try {
      fn(context, event, callback);
    } catch (err) {
      callback(err.message);
    }
  };
}
