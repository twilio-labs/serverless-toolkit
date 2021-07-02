import { TwilioResponse } from '@twilio-labs/serverless-runtime-types/types';
import { Headers, HeaderValue } from '../types';
import { Response as ExpressResponse } from 'express';
import debug from '../utils/debug';

const log = debug('twilio-runtime-handler:dev:response');

type ResponseOptions = {
  headers?: Headers;
  statusCode?: number;
  body?: object | string;
};

export class Response implements TwilioResponse {
  private body: null | any;
  private statusCode: number;
  private headers: Headers;

  constructor(options?: ResponseOptions) {
    this.body = null;
    this.statusCode = 200;
    this.headers = {};

    if (options && options.statusCode) {
      this.statusCode = options.statusCode;
    }
    if (options && options.body) {
      this.body = options.body;
    }
    if (options && options.headers) {
      this.headers = options.headers;
    }
  }

  setStatusCode(statusCode: number): Response {
    log('Setting status code to %d', statusCode);
    this.statusCode = statusCode;
    return this;
  }

  setBody(body: object | string): Response {
    log('Setting response body to %o', body);
    this.body = body;
    return this;
  }

  setHeaders(headersObject: Headers): Response {
    log('Setting headers to: %P', headersObject);
    if (typeof headersObject !== 'object') {
      return this;
    }
    this.headers = headersObject;
    return this;
  }

  appendHeader(key: string, value: HeaderValue): Response {
    log('Appending header for %s', key, value);
    this.headers = this.headers || {};
    const existingValue = this.headers[key];
    let newHeaderValue: HeaderValue = [];
    if (existingValue) {
      if (Array.isArray(existingValue) && Array.isArray(value)) {
        newHeaderValue = [...existingValue, ...value];
      } else if (Array.isArray(existingValue) && !Array.isArray(value)) {
        newHeaderValue = [...existingValue, value];
      } else if (!Array.isArray(existingValue) && Array.isArray(value)) {
        newHeaderValue = [existingValue, ...value];
      } else if (!Array.isArray(existingValue) && !Array.isArray(value)) {
        newHeaderValue = [existingValue, value];
      }
      if (newHeaderValue) {
        this.headers[key] = newHeaderValue;
      }
    } else {
      this.headers[key] = value;
    }
    return this;
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
      body:
        this.headers['Content-Type'] === 'application/json'
          ? JSON.stringify(this.body)
          : this.body,
      headers: this.headers,
    };
  }
}
