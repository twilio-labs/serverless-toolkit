import { TwilioResponse } from '@twilio-labs/serverless-runtime-types/types';
import { Response as ExpressResponse } from 'express';
import debug from '../utils/debug';

const log = debug('twilio-runtime-handler:dev:response');

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
    log('Setting headers to: %P', headersObject);
    if (typeof headersObject !== 'object') {
      return;
    }
    this.headers = headersObject;
  }

  appendHeader(key: string, value: HeaderValue): void {
    log('Appending header for %s', key, value);
    this.headers = this.headers || {};
    this.headers[key] = value;
  }

  applyToExpressResponse(res: ExpressResponse): void {
    log('Setting values on response: %P', {
      statusCode: this.statusCode,
      headers: this.headers,
      body: this.body,
    });
    res.status(this.statusCode);
    res.set(this.headers);
    res.send(this.body);
  }

  serialize() {
    return {
      statusCode: this.statusCode,
      body: this.body.toString(),
      headers: this.headers,
    };
  }
}
