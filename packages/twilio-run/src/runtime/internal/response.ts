import { TwilioResponse } from '@twilio-labs/serverless-runtime-types/types';
import { Response as ExpressResponse } from 'express';
import { getDebugFunction } from '../../utils/logger';
import {
  HeaderValue,
  Headers,
} from '@twilio/runtime-handler/dist/dev-runtime/types';

const debug = getDebugFunction('twilio-run:response');
const COOKIE_HEADER = 'Set-Cookie';

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
    // if Set-Cookie is not already in the headers, then add it as an empty list
    const cookieHeader: HeaderValue = this.headers[COOKIE_HEADER];
    if (!(COOKIE_HEADER in this.headers)) {
      this.headers[COOKIE_HEADER] = [];
    }
    if (!Array.isArray(cookieHeader) && typeof cookieHeader !== 'undefined') {
      this.headers[COOKIE_HEADER] = [cookieHeader];
    }
  }

  setStatusCode(statusCode: number): TwilioResponse {
    debug('Setting status code to %d', statusCode);
    this.statusCode = statusCode;
    return this;
  }

  setBody(body: object | string): TwilioResponse {
    debug('Setting response body to %o', body);
    this.body = body;
    return this;
  }

  setHeaders(headersObject: Headers): TwilioResponse {
    debug('Setting headers to: %P', headersObject);
    if (typeof headersObject !== 'object') {
      return this;
    }
    this.headers = headersObject;
    return this;
  }

  appendHeader(key: string, value: HeaderValue): Response {
    debug('Appending header for %s', key, value);
    if (typeof value === 'object' && !Array.isArray(value)) {
      throw new Error('Header value cannot be an object');
    }
    this.headers = this.headers || {};
    let newHeaderValue: HeaderValue = [];
    if (key.toLowerCase() === COOKIE_HEADER.toLowerCase()) {
      const existingValue: HeaderValue = this.headers[COOKIE_HEADER];
      if (existingValue) {
        newHeaderValue = [existingValue, value].flat();
        if (newHeaderValue) {
          this.headers[COOKIE_HEADER] = newHeaderValue;
        }
      } else {
        this.headers[COOKIE_HEADER] = Array.isArray(value) ? value : [value];
      }
    } else {
      const existingValue: HeaderValue = this.headers[key];
      if (existingValue) {
        newHeaderValue = [existingValue, value].flat();
        if (newHeaderValue) {
          this.headers[key] = newHeaderValue;
        }
      } else {
        this.headers[key] = value;
      }
    }
    if (!(COOKIE_HEADER in this.headers)) {
      this.headers[COOKIE_HEADER] = [];
    }
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

  setCookie(key: string, value: string, attributes: string[] = []): Response {
    debug('Setting cookie %s=%s', key, value);
    const cookie =
      `${key}=${value}` +
      (attributes.length > 0 ? `;${attributes.join(';')}` : '');
    this.appendHeader(COOKIE_HEADER, cookie);
    return this;
  }

  removeCookie(key: string): TwilioResponse {
    debug('Removing cookie %s', key);
    let cookieHeader: HeaderValue = this.headers[COOKIE_HEADER];
    if (!Array.isArray(cookieHeader)) {
      cookieHeader = [cookieHeader];
    }
    const newCookies: (string | number)[] = cookieHeader.filter(
      (cookie: string | number) =>
        typeof cookie === 'string' && !cookie.startsWith(`${key}=`)
    );
    newCookies.push(`${key}=;Max-Age=0`);
    this.headers[COOKIE_HEADER] = newCookies;
    return this;
  }
}
