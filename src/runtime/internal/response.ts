import { TwilioResponse } from '@twilio-labs/serverless-runtime-types/types';
import { Response as ExpressResponse } from 'express';
import { getDebugFunction } from '../../utils/logger';

const debug = getDebugFunction('twilio-run:response');

type HeaderValue = number | string;
type Headers = {
  [key: string]: HeaderValue;
};

export class Response implements TwilioResponse {
  private body: undefined | any;
  private statusCode: number;
  private headers: Headers;

  constructor() {
    this.body = undefined;
    this.statusCode = 200;
    this.headers = {};
  }

  setStatusCode(statusCode: number): void {
    debug('Setting status code to %d', statusCode);
    this.statusCode = statusCode;
  }

  setBody(body: object | string): void {
    debug('Setting response body to %o', body);
    this.body = body;
  }

  setHeaders(headersObject: Headers): void {
    debug('Setting headers to: %P', headersObject);
    if (typeof headersObject !== 'object') {
      return;
    }
    this.headers = headersObject;
  }

  appendHeader(key: string, value: HeaderValue): void {
    debug('Appending header for %s', key, value);
    this.headers = this.headers || {};
    this.headers[key] = value;
  }

  applyToExpressResponse(res: ExpressResponse): void {
    debug('Setting values on response: %P', {
      statusCode: this.statusCode,
      headers: this.headers,
      body: this.body,
    });
    res.status(this.statusCode);
    res.set(this.headers);
    res.send(this.body);
  }
}
