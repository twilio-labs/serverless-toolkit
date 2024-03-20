import {
  Context,
  ServerlessCallback,
  ServerlessEventObject,
  ServerlessFunctionSignature,
} from '@twilio-labs/serverless-runtime-types/types';
import { fork } from 'child_process';
import {
  NextFunction,
  Request as ExpressRequest,
  RequestHandler as ExpressRequestHandler,
  Response as ExpressResponse,
} from 'express';
import { join, resolve } from 'path';
import { deserializeError } from 'serialize-error';
import twilio, { twiml } from 'twilio';
import { checkForValidAccountSid } from '../checks/check-account-sid';
import { checkForValidAuthToken } from '../checks/check-auth-token';
import { StartCliConfig } from '../config/start';
import { wrapErrorInHtml } from '../utils/error-html';
import { getDebugFunction } from '../utils/logger';
import { cleanUpStackTrace } from '../utils/stack-trace/clean-up';
import { Reply } from './internal/functionRunner';
import { Response } from './internal/response';
import * as Runtime from './internal/runtime';
import * as PATH from 'path';

const RUNNER_PATH =
  process.env.NODE_ENV === 'test'
    ? resolve(__dirname, '../../dist/runtime/internal/functionRunner')
    : join(__dirname, 'internal', 'functionRunner');

const { VoiceResponse, MessagingResponse, FaxResponse } = twiml;

const debug = getDebugFunction('twilio-run:route');

export function constructEvent<T extends ServerlessEventObject>(
  req: ExpressRequest
): T {
  return { ...req.query, ...req.body };
}

export function constructContext<T extends {} = {}>(
  { url, env }: StartCliConfig,
  functionPath: string
): Context<{
  ACCOUNT_SID?: string;
  AUTH_TOKEN?: string;
  DOMAIN_NAME: string;
  PATH: string;
  [key: string]: string | undefined | Function;
}> {
  function getTwilioClient(): twilio.Twilio {
    checkForValidAccountSid(env.ACCOUNT_SID, {
      shouldPrintMessage: true,
      shouldThrowError: true,
      functionName: 'context.getTwilioClient()',
    });
    checkForValidAuthToken(env.AUTH_TOKEN, {
      shouldPrintMessage: true,
      shouldThrowError: true,
      functionName: 'context.getTwilioClient()',
    });

    return twilio(env.ACCOUNT_SID, env.AUTH_TOKEN);
  }
  const DOMAIN_NAME = url.replace(/^https?:\/\//, '');
  const PATH = functionPath;
  return {
    ENVIRONMENT_SID: undefined,
    SERVICE_SID: undefined,
    PATH,
    DOMAIN_NAME,
    ...env,
    getTwilioClient,
  };
}

export function constructGlobalScope(config: StartCliConfig): void {
  const GlobalRuntime = Runtime.create(config);
  (global as any)['Twilio'] = { ...twilio, Response };
  (global as any)['Runtime'] = GlobalRuntime;
  (global as any)['Functions'] = GlobalRuntime.getFunctions();
  (global as any)['Response'] = Response;

  if (
    checkForValidAccountSid(config.env.ACCOUNT_SID) &&
    config.env.AUTH_TOKEN
  ) {
    (global as any)['twilioClient'] = twilio(
      config.env.ACCOUNT_SID,
      config.env.AUTH_TOKEN
    );
  }
}

function isError(obj: any): obj is Error {
  return obj instanceof Error;
}

export function handleError(
  err: Error | string | object,
  req: ExpressRequest,
  res: ExpressResponse,
  functionFilePath?: string
) {
  res.status(500);
  if (isError(err)) {
    const cleanedupError = cleanUpStackTrace(err);

    if (req.useragent && (req.useragent.isDesktop || req.useragent.isMobile)) {
      res.type('text/html');
      res.send(wrapErrorInHtml(cleanedupError, functionFilePath));
    } else {
      res.send({
        message: cleanedupError.message,
        name: cleanedupError.name,
        stack: cleanedupError.stack,
      });
    }
  } else {
    res.send(err);
  }
}

export function isTwiml(obj: object): boolean {
  const isVoiceTwiml = obj instanceof VoiceResponse;
  const isMessagingTwiml = obj instanceof MessagingResponse;
  const isFaxTwiml = obj instanceof FaxResponse;
  return isVoiceTwiml || isMessagingTwiml || isFaxTwiml;
}

export function handleSuccess(
  responseObject: string | number | boolean | object | undefined,
  res: ExpressResponse
) {
  res.status(200);
  if (typeof responseObject === 'string') {
    debug('Sending basic string response');
    res.type('text/plain').send(responseObject);
    return;
  }

  if (
    responseObject &&
    typeof responseObject === 'object' &&
    isTwiml(responseObject)
  ) {
    debug('Sending TwiML response as XML string');
    res.type('text/xml').send(responseObject.toString());
    return;
  }

  if (responseObject && responseObject instanceof Response) {
    debug('Sending custom response');
    responseObject.applyToExpressResponse(res);
    return;
  }

  debug('Sending JSON response');
  res.send(responseObject);
}

export function functionPathToRoute(
  functionPath: string,
  config: StartCliConfig
) {
  return function twilioFunctionHandler(
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
  ) {
    const event = constructEvent(req);
    const forked = fork(RUNNER_PATH);
    forked.on(
      'message',
      ({
        err,
        reply,
        debugMessage,
        debugArgs = [],
      }: {
        err?: Error | number | string;
        reply?: Reply;
        debugMessage?: string;
        debugArgs?: any[];
      }) => {
        if (debugMessage) {
          debug(debugMessage, ...debugArgs);
          return;
        }
        if (err) {
          const error = deserializeError(err);
          handleError(error, req, res, functionPath);
        }
        if (reply) {
          res.status(reply.statusCode);
          res.set(reply.headers);
          res.send(reply.body);
        }
        forked.kill();
      }
    );

    forked.send({ functionPath, event, config, path: req.path });
  };
}

export function functionToRoute(
  fn: ServerlessFunctionSignature,
  config: StartCliConfig,
  functionFilePath?: string
): ExpressRequestHandler {
  return function twilioFunctionHandler(
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
  ) {
    const event = constructEvent(req);
    debug('Event for %s: %o', req.path, event);
    const context = constructContext(config, req.path);
    debug('Context for %s: %p', req.path, context);
    let run_timings: {
      start: [number, number];
      end: [number, number];
    } = {
      start: [0, 0],
      end: [0, 0],
    };

    const callback: ServerlessCallback = function callback(err, payload?) {
      run_timings.end = process.hrtime();
      debug('Function execution %s finished', req.path);
      debug(
        `(Estimated) Total Execution Time: ${
          (run_timings.end[0] * 1e9 +
            run_timings.end[1] -
            (run_timings.start[0] * 1e9 + run_timings.start[1])) /
          1e6
        }ms`
      );
      if (err) {
        handleError(err, req, res, functionFilePath);
        return;
      }
      handleSuccess(payload, res);
    };

    debug('Calling function for %s', req.path);
    try {
      run_timings.start = process.hrtime();
      fn(context, event, callback);
    } catch (err) {
      callback(err);
    }
  };
}
