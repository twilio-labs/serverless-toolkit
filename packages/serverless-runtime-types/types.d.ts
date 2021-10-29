import * as twilio from 'twilio';
import { ServiceContext } from 'twilio/lib/rest/sync/v1/service';
import { SyncListListInstance } from 'twilio/lib/rest/sync/v1/service/syncList';
import { SyncMapListInstance } from 'twilio/lib/rest/sync/v1/service/syncMap';
import { TwilioClientOptions } from 'twilio/lib/rest/Twilio';

export type EnvironmentVariables = {
  [key: string]: string | undefined;
};

export type ResourceMap = {
  [name: string]: {
    path: string;
  };
};

export type AssetResourceMap = {
  [name: string]: {
    path: string;
    open(): string;
  };
};

export interface TwilioResponse {
  /**
   * Set the status code of the response.
   * @param code - Integer value of the status code
   * @returns This Response object to enable method chaining
   *
   * @see https://www.twilio.com/docs/runtime/functions/invocation#twilio-response-methods
   *
   * Example usage of Response.setStatusCode():
   * ```ts
   * exports.handler = (context, event, callback) => {
   *   const response = new Twilio.Response();
   *   // Set the status code to 204 Not Content
   *   response.setStatusCode(204);
   *
   *   return callback(null, response);
   * };
   * ```
   *
   */
  setStatusCode(code: number): TwilioResponse;
  /**
   * Set the body of the response. Takes either a string or an object.
   * @param body - The body of the response
   * @returns This Response object to enable method chaining
   *
   * @see https://www.twilio.com/docs/runtime/functions/invocation#twilio-response-methods
   *
   * Example usage of Response.setBody() with a string
   * ```ts
   * exports.handler = (context, event, callback) => {
   *   const response = new Twilio.Response();
   *   // Set the response body
   *   response.setBody('Everything is fine');
   *
   *   return callback(null, response);
   * };
   * ```
   *
   * Example usage of Response.setBody() with an object
   * ```ts
   * exports.handler = (context, event, callback) => {
   *   const response = new Twilio.Response();
   *   // Set the response body
   *   response.setBody({ everything: 'is fine' });
   *
   *   return callback(null, response);
   * };
   * ```
   */
  setBody(body: string | object): TwilioResponse;
  /**
   * Adds a header to the HTTP response. The first argument specifies the header name and the second argument the header value.
   *
   * If Response.appendHeader is called with the name of a header that already exists on this Response object, that header will be converted from a string to an array, and the provided value will be concatenated to that array of values.
   *
   * @param key - The name of the header
   * @param value - The value of the header
   * @returns This Response object to enable method chaining
   *
   * @see https://www.twilio.com/docs/runtime/functions/headers-and-cookies/setting-and-modifying#responseappendheaderkey-value
   *
   * Example usage of Response.appendHeader()
   * ```ts
   * exports.handler = (context, event, callback) => {
   *   const response = new Twilio.Response();
   *   response
   *     .appendHeader('content-type', 'application/json')
   *     // You can append a multi-value header by passing a list of strings
   *     .appendHeader('yes', ['no', 'maybe', 'so'])
   *     // Instead of setting the header to an array, it's also valid to
   *     // pass a comma-separated string of values
   *     .appendHeader('cache-control', 'no-store, max-age=0');
   *     .appendHeader('never', 'gonna')
   *     // Appending a header that already exists will convert that header to
   *     // a multi-value header and concatenate the new value
   *     .appendHeader('never', 'give')
   *     .appendHeader('never', 'you')
   *     .appendHeader('never', 'up');
   *     // The header is now `'never': ['gonna', 'give', 'you', 'up']`
   *
   *   return callback(null, response);
   * };
   * ```
   */
  appendHeader(key: string, value: string): TwilioResponse;
  /**
   * Set multiple headers on the HTTP response in one method call. Accepts an object of key-value pairs of headers and their corresponding values. You may also set multi-value headers by making the intended header an array.
   *
   * @param headers - An object of headers to append to the response. Can include set-cookie
   * @returns This Response object to enable method chaining
   *
   * @see https://www.twilio.com/docs/runtime/functions/headers-and-cookies/setting-and-modifying#responsesetheadersheaders
   *
   * Example usage of Response.setHeaders()
   * ```ts
   * exports.handler = (context, event, callback) => {
   *   const response = new Twilio.Response();
   *   response.setHeaders({
   *     // Set a single header
   *     'content-type': 'application/json',
   *     // You can set a header with multiple values by providing an array
   *     'cache-control': ['no-cache', 'private'],
   *     // You may also optionally set cookies via the "Set-Cookie" key
   *     'set-cookie': 'Foo=Bar',
   *   });
   *
   *   return callback(null, response);
   * };
   * ```
   */
  setHeaders(headers: { [key: string]: string }): TwilioResponse;
  /**
   * Add a cookie to the HTTP response. Accepts the name of the cookie, its value, and any optional attributes to be assigned to the cookie
   *
   * @param key - The name of the cookie to be set
   * @param value - The value of the cookie
   * @param attributes - Optional attributes to assign to the cookie
   * @returns This Response object to enable method chaining
   *
   * @see https://www.twilio.com/docs/runtime/functions/headers-and-cookies/setting-and-modifying#responsesetcookiekey-value-attributes
   *
   * Example usage of Response.setCookie()
   * ```ts
   * exports.handler = (context, event, callback) => {
   *   const response = new Twilio.Response();
   *   response
   *     .setCookie('has_recent_activity', 'true')
   *     .setCookie('tz', 'America/Los_Angeles', [
   *       'HttpOnly',
   *       'Secure',
   *       'SameSite=Strict',
   *       'Max-Age=86400',
   *     ]);
   *
   *   return callback(null, response);
   * };
   * ```
   */
  setCookie(key: string, value: string, attributes?: string[]): TwilioResponse;
  /**
   * Effectively remove a specific cookie from the HTTP response. Accepts the name of the cookie to be removed, and sets the Max-Age attribute of the cookie equal to 0 so that clients and browsers will remove the cookie upon receiving the response.
   *
   * @param key - The name of the cookie to be removed
   * @returns This Response object to enable method chaining
   *
   * @see https://www.twilio.com/docs/runtime/functions/headers-and-cookies/setting-and-modifying#responseremovecookiekey
   *
   * Example usage of Response.removeCookie()
   * ```ts
   * exports.handler = (context, event, callback) => {
   *   const response = new Twilio.Response();
   *   response.removeCookie('tz');
   *
   *   return callback(null, response);
   * };
   * ```
   */
  removeCookie(key: string): TwilioResponse;
}

export type RuntimeSyncClientOptions = TwilioClientOptions & {
  serviceName?: string;
};

export type RuntimeSyncServiceContext = ServiceContext & {
  maps: SyncMapListInstance;
  lists: SyncListListInstance;
};

export type RuntimeInstance = {
  getAssets(): AssetResourceMap;
  getFunctions(): ResourceMap;
  getSync(options?: RuntimeSyncClientOptions): RuntimeSyncServiceContext;
};

export type Context<T = {}> = {
  getTwilioClient(options?: TwilioClientOptions): twilio.Twilio;
  DOMAIN_NAME: string;
  PATH: string;
  SERVICE_SID: string | undefined;
  ENVIRONMENT_SID: string | undefined;
} & T;

export type ServerlessCallback = (
  error: null | Error | string | object,
  payload?: object | string | number | boolean
) => void;

export type ServerlessEventObject<
  RequestBodyAndQuery = {},
  Headers = {},
  Cookies = {}
> = {
  request: {
    cookies: Cookies;
    headers: Headers;
  };
} & RequestBodyAndQuery;

export type ServerlessFunctionSignature<
  T extends EnvironmentVariables = {},
  U extends ServerlessEventObject = { request: { cookies: {}; headers: {} } }
> = (
  context: Context<T>,
  event: U,
  callback: ServerlessCallback
) => void | Promise<void>;

export type ResponseConstructor = new (...args: any[]) => TwilioResponse;
export type GlobalTwilio = Omit<typeof twilio, 'default'> & {
  Response: ResponseConstructor;
};

export { ServiceContext } from 'twilio/lib/rest/sync/v1/service';
export { SyncListListInstance } from 'twilio/lib/rest/sync/v1/service/syncList';
export { SyncMapListInstance } from 'twilio/lib/rest/sync/v1/service/syncMap';
export { TwilioClientOptions } from 'twilio/lib/rest/Twilio';
export type TwilioClient = twilio.Twilio;
export type TwilioPackage = typeof twilio;
