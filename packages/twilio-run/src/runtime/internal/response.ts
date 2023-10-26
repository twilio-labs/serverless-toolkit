import { TwilioResponse } from '@twilio-labs/serverless-runtime-types/types';
import { Response as ExpressResponse } from 'express';
import { getDebugFunction } from '../../utils/logger';

const debug = getDebugFunction('twilio-run:response');

type ResponseOptions = {
  headers?: Headers;
  statusCode?: number;
  body?: object | string;
};

type HeaderValue = number | string;
type Headers = {
  [key: string]: HeaderValue;
};

type CookieValue = {
  value: string;
  attributes?: string[] | undefined;
};
type Cookies = {
  [key: string]: CookieValue;
};

export class Response implements TwilioResponse {
  private body: null | any;
  private statusCode: number;
  private headers: Headers;
  private cookies: Cookies;

  constructor(options?: ResponseOptions) {
    this.body = null;
    this.statusCode = 200;
    this.headers = {};
    this.cookies = {};

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
    debug('Setting status code to %d', statusCode);
    this.statusCode = statusCode;
    return this;
  }

  setBody(body: object | string): Response {
    debug('Setting response body to %o', body);
    this.body = body;
    return this;
  }

  setHeaders(headersObject: Headers): Response {
    debug('Setting headers to: %P', headersObject);
    if (typeof headersObject !== 'object') {
      return this;
    }
    this.headers = headersObject;
    return this;
  }

  setCookie(
    key: string,
    value: string,
    attributes?: string[] | undefined
  ): Response {
    debug('Setting cookie %s', key, value, attributes);
    this.cookies[key] = { value, attributes };
    return this;
  }

  removeCookie(key: string): Response {
    debug('Deleting cookie %s', key);
    delete this.cookies[key];
    return this;
  }

  appendHeader(key: string, value: HeaderValue): Response {
    debug('Appending header for %s', key, value);
    this.headers = this.headers || {};
    this.headers[key] = value;
    return this;
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
