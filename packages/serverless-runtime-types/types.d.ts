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
   *
   * @param code - Integer value of the status code
   * @returns This `TwilioResponse` object to enable method chaining
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
   */
  setStatusCode(code: number): TwilioResponse;
  /**
   * Set the body of the response. Takes either a string or an object.
   *
   * @param body - The body of the response
   * @returns This `TwilioResponse` object to enable method chaining
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
   * Add a header to the HTTP response. The first argument specifies the header name and the second argument the header value.
   *
   * If Response.appendHeader is called with the name of a header that already exists on this Response object, that header will be converted from a string to an array, and the provided value will be concatenated to that array of values.
   *
   * @param key - The name of the header
   * @param value - The value of the header
   * @returns This `TwilioResponse` object to enable method chaining
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
   * Set multiple headers on the HTTP response in one method call.
   * Accepts an object of key-value pairs of headers and their corresponding values.
   * You may also set multi-value headers by making the intended header an array.
   *
   * @param headers - An object of headers to append to the response. Can include set-cookie
   * @returns This `TwilioResponse` object to enable method chaining
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
   * Add a cookie to the HTTP response.
   * Accepts the name of the cookie, its value, and any optional attributes to be assigned to the cookie.
   *
   * @param key - The name of the cookie to be set
   * @param value - The value of the cookie
   * @param attributes - Optional attributes to assign to the cookie
   * @returns This `TwilioResponse` object to enable method chaining
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
   * Effectively remove a specific cookie from the HTTP response.
   * Accepts the name of the cookie to be removed, and sets the Max-Age attribute of the cookie equal to 0 so that clients and browsers will remove the cookie upon receiving the response.
   *
   * @param key - The name of the cookie to be removed
   * @returns This `TwilioResponse` object to enable method chaining
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
  /**
   * Alias for `syncMaps`
   *
   * @see https://www.twilio.com/docs/sync/api/list-resource
   */
  maps: SyncMapListInstance;
  /**
   * Alias for `syncLists`
   *
   * @see https://www.twilio.com/docs/sync/api/map-resource
   */
  lists: SyncListListInstance;
};

export type RuntimeInstance = {
  /**
   * Returns an object containing the names each private Asset in the same Service as this Function.
   * Each Asset name serves as the key to an Asset object that contains the path to that Asset, as well as an open method that can be used to access its contents.
   *
   * @returns Key-value pairs of Asset names and Asset objects
   *
   * @see https://www.twilio.com/docs/runtime/client#runtimegetassets
   *
   * Usage of Runtime.getAssets() to read the file contents of an Asset
   * ```ts
   * exports.handler = function (context, event, callback) {
   *   const openFile = Runtime.getAssets()['/my_file.txt'].open;
   *   // Calling open is equivalent to using fs.readFileSync(asset.filePath, 'utf8')
   *   const text = openFile();
   *   console.log('Your file contents: ' + text);
   *   return callback();
   * };
   * ```
   *
   * Usage of Runtime.getAssets() to load a JavaScript module from an Asset
   * ```ts
   * exports.handler = function (context, event, callback) {
   *   // First, get the path for the Asset
   *   const path = Runtime.getAssets()['/answer-generator.js'].path;
   *   // Next, you can use require() to import the library
   *   const module = require(path);
   *   // Finally, use the module as you would any other
   *   console.log('The answer to your riddle is: ' + module.getAnswer());
   *   return callback();
   * };
   * ```
   */
  getAssets(): AssetResourceMap;
  /**
   * Returns an object that contains the names of every Function in the Service.
   * Each Function name serves as the key to a Function object that contains the path to that Function.
   * These paths can be used to import code from other Functions and to compose code hosted on Twilio Functions.
   *
   * @returns Key-value pairs of Function names and Function objects
   *
   * @see https://www.twilio.com/docs/runtime/client#runtimegetfunctions
   *
   * Usage of Runtime.getFunctions() to import code from another Function.
   * Suppose we define a Function titled zoltar:
   * ```ts
   * exports.ask = () => {
   *   const fortunes = [...];
   *   // Generate a random index and return the given fortune
   *   return fortunes[Math.floor(Math.random() * fortunes.length)];
   * };
   * ```
   *
   * You could then use the ask function in another Function:
   * ```ts
   * exports.handler = function (context, event, callback) {
   *   // First, get the path for the Function. Note that the key of the function
   *   // is not preceded by a "/" as is the case with Assets
   *   const zoltarPath = Runtime.getFunctions()['zoltar'].path;
   *   // Next, use require() to import the library
   *   const zoltar = require(zoltarPath);
   *   // Finally, use the module as you would any other!
   *   console.log('The answer to your riddle is: ' + zoltar.ask());
   *   return callback();
   * }
   * ```
   */
  getFunctions(): ResourceMap;
  /**
   * Returns a Sync Service Context object that has been configured to work with your default Sync Service.
   *
   * @param options - Optional object to configure the Sync Context, such as the name of a different Sync Service
   * @returns A Sync Context object for interacting with Twilio Sync
   *
   * @see https://www.twilio.com/docs/runtime/client#runtimegetsyncoptions
   *
   * Usage of Runtime.getSync() to get information about the default Sync instance.
   * ```ts
   * exports.handler = (context, event, callback) => {
   *   // Use the getSync method with no arguments to get a reference to the default
   *   // Sync document for your account. Fetch returns a Promise, which will
   *   // eventually resolve to metadata about the Sync Service, such as its SID
   *   Runtime.getSync()
   *     .fetch()
   *     .then((defaultSyncService) => {
   *       console.log('Sync Service SID: ', defaultSyncService.sid);
   *       return callback(null, defaultSyncService.sid);
   *     })
   *     .catch((error) => {
   *       console.log('Sync Error: ', error);
   *       return callback(error);
   *     });
   * };
   * ```
   *
   * You can use the Sync Client for many other operations, such as appending item(s) to a Sync List.
   * ```ts
   * exports.handler = (context, event, callback) => {
   *   // Given an existing Sync List with the uniqueName of spaceShips, you can use
   *   // syncListItems.create to append a new data entry which will be accessible
   *   // to any other Function or product with access to the Sync List
   *   Runtime.getSync()
   *     .lists('spaceShips')
   *     .syncListItems.create({
   *       data: {
   *         text: 'Millennium Falcon',
   *       },
   *     })
   *     .then((response) => {
   *       console.log(response);
   *       return callback(null, response);
   *     })
   *     .catch((error) => {
   *       console.log('Sync Error: ', error);
   *       return callback(error);
   *     });
   * };
   * ```
   */
  getSync(options?: RuntimeSyncClientOptions): RuntimeSyncServiceContext;
};

export type Context<T = {}> = {
  /**
   * If you have enabled the inclusion of your account credentials in your Function, this will return an initialized Twilio REST Helper Library. If you have not included account credentials in your Function, calling this method will result in an error.
   *
   * @param options - Optional object to configure the Twilio Client, such as enabling lazy loading
   * @returns An initialized Twilio Client
   *
   * @see https://www.twilio.com/docs/runtime/functions/invocation#helper-methods
   *
   * Usage of context.getTwilioClient() to get an initialized Twilio Client and send a SMS.
   * ```ts
   * exports.handler = function (context, event, callback) {
   *   // Fetch already initialized Twilio REST client
   *   const twilioClient = context.getTwilioClient();
   *   // Determine message details from the incoming event, with fallback values
   *   const from = event.From || '+15095550100';
   *   const to = event.To || '+15105550101';
   *   const body = event.Body || 'Ahoy, World!';
   *
   *   twilioClient.messages
   *     .create({ to, from, body })
   *     .then((result) => {
   *       console.log('Created message using callback: ', result.sid);
   *       return callback();
   *     })
   *     .catch((error) => {
   *       console.error(error);
   *       return callback(error);
   *     });
   * };
   * ```
   */
  getTwilioClient(options?: TwilioClientOptions): twilio.Twilio;
  /**
   * The domain name for the Service that contains this Function.
   */
  DOMAIN_NAME: string;
  /**
   * The path of this Function
   */
  PATH: string;
  /**
   * The unique SID of the Service that contains this Function
   */
  SERVICE_SID: string | undefined;
  /**
   * The unique SID of the Environment that this Function has been deployed to
   */
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
