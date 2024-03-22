import { ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { serializeError } from 'serialize-error';
import { getRouteMap } from '../internal/route-cache';
import { constructContext, constructGlobalScope, isTwiml } from '../route';
import { Response } from './response';
import { Headers } from '@twilio/runtime-handler/dist/dev-runtime/types';

const sendDebugMessage = (debugMessage: string, ...debugArgs: any) => {
  process.send && process.send({ debugMessage, debugArgs });
};

export type Reply = {
  body?: string | number | boolean | object;
  headers?: Headers;
  statusCode: number;
};

const handleError = (err: Error | string | object) => {
  if (err) {
    process.send && process.send({ err: serializeError(err) });
  }
};

const handleSuccess = (responseObject?: string | number | boolean | object) => {
  let reply: Reply = { statusCode: 200 };
  if (typeof responseObject === 'string') {
    sendDebugMessage('Sending basic string response');
    reply.headers = { 'Content-Type': 'text/plain' };
    reply.body = responseObject;
  } else if (
    responseObject &&
    typeof responseObject === 'object' &&
    isTwiml(responseObject)
  ) {
    sendDebugMessage('Sending TwiML response as XML string');
    reply.headers = { 'Content-Type': 'text/xml' };
    reply.body = responseObject.toString();
  } else if (responseObject && responseObject instanceof Response) {
    sendDebugMessage('Sending custom response');
    reply = responseObject.serialize();
  } else {
    sendDebugMessage('Sending JSON response');
    reply.body = responseObject;
    reply.headers = { 'Content-Type': 'application/json' };
  }

  if (process.send) {
    process.send({ reply });
  }
};

process.on('message', async ({ functionPath, event, config, path }) => {
  try {
    await getRouteMap(config);
    constructGlobalScope(config);
    const context = constructContext(config, path);
    sendDebugMessage('Context for %s: %p', path, context);
    sendDebugMessage('Event for %s: %o', path, event);
    let run_timings: { start: [number, number]; end: [number, number] } = {
      start: [0, 0],
      end: [0, 0],
    };

    const callback: ServerlessCallback = (err, responseObject) => {
      run_timings.end = process.hrtime();
      sendDebugMessage('Function execution %s finished', path);
      sendDebugMessage(
        `(Estimated) Total Execution Time: ${
          (run_timings.end[0] * 1e9 +
            run_timings.end[1] -
            (run_timings.start[0] * 1e9 + run_timings.start[1])) /
          1e6
        }ms`
      );
      if (err) {
        handleError(err);
      } else {
        handleSuccess(responseObject);
      }
    };

    sendDebugMessage('Calling function for %s', path);
    run_timings.start = process.hrtime();
    const { handler } = require(functionPath);
    if (typeof handler !== 'function') {
      throw new Error(
        `Could not find a "handler" function in file ${functionPath}`
      );
    }
    handler(context, event, callback);
  } catch (err) {
    if (process.send) {
      process.send({ err: serializeError(err) });
    }
  }
});
