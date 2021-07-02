import { TwilioResponse } from '@twilio-labs/serverless-runtime-types/types';
import { Headers, HeaderValue } from '../types';
import { Response as ExpressResponse } from 'express';
import debug from '../utils/debug';

const log = debug('twilio-runtime-handler:dev:response');
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
    const cookieHeader = this.headers[COOKIE_HEADER];
    if (!(COOKIE_HEADER in this.headers)) {
      this.headers[COOKIE_HEADER] = [];
    }
    if (!Array.isArray(cookieHeader) && typeof cookieHeader !== 'undefined') {
      this.headers[COOKIE_HEADER] = [cookieHeader];
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
    if (!(COOKIE_HEADER in headersObject)) {
      headersObject[COOKIE_HEADER] = [];
    }

    const cookieHeader = headersObject[COOKIE_HEADER];
    if (!Array.isArray(cookieHeader)) {
      headersObject[COOKIE_HEADER] = [cookieHeader];
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
      newHeaderValue = [existingValue, value].flat();
      if (newHeaderValue) {
        this.headers[key] = newHeaderValue;
      }
    } else {
      if (key === COOKIE_HEADER && !Array.isArray(value)) {
        this.headers[key] = [value];
      } else {
        this.headers[key] = value;
      }
    }
    if (!(COOKIE_HEADER in this.headers)) {
      this.headers[COOKIE_HEADER] = [];
    }
    return this;
  }

  setCookie(key: string, value: string, attributes: string[] = []): Response {
    log('Setting cookie %s=%s', key, value);
    const cookie =
      `${key}=${value}` +
      (attributes.length > 0 ? `;${attributes.join(';')}` : '');
    this.appendHeader(COOKIE_HEADER, cookie);
    return this;
  }

  removeCookie(key: string): Response {
    log('Removing cookie %s', key);
    let cookieHeader = this.headers[COOKIE_HEADER];
    if (!Array.isArray(cookieHeader)) {
      cookieHeader = [cookieHeader];
    }
    const newCookies = cookieHeader.filter(
      (cookie) => typeof cookie === 'string' && !cookie.startsWith(`${key}=`)
    );
    newCookies.push(`${key}=;Max-Age=0`);
    this.headers[COOKIE_HEADER] = newCookies;
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
