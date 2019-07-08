import debug from 'debug';
import { Response as ExpressResponse } from 'express';
import { TwilioResponse } from '@twilio-labs/serverless-runtime-types/types';

const log = debug('twilio-run:response');

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
    log('Setting status code to %d', statusCode);
    this.statusCode = statusCode;
  }

  setBody(body: object | string): void {
    log('Setting response body to %o', body);
    this.body = body;
  }

  setHeaders(headersObject: Headers): void {
    log('Setting headers to: %O', headersObject);
    if (typeof headersObject !== 'object') {
      return;
    }
    this.headers = headersObject;
  }

  appendHeader(key: string, value: HeaderValue): void {
    log('Appending header for %s as %s', key, value);
    this.headers = this.headers || {};
    this.headers[key] = value;
  }

  applyToExpressResponse(res: ExpressResponse): void {
    log('Setting values on response: %O', {
      statusCode: this.statusCode,
      headers: this.headers,
      body: this.body,
    });
    res.status(this.statusCode);
    res.set(this.headers);
    res.send(this.body);
  }
}
