// import {  } from 'got';

import { RequestError } from 'got/dist/source';
import { URL } from 'url';

export type TwilioApiError = {
  code: number;
  message: string;
  more_info: string;
  status: number;
};

function toTwilioApiError(response: unknown): TwilioApiError | undefined {
  if (typeof response !== 'object') {
    return undefined;
  }

  return response as TwilioApiError;
}

/**
 * Explictly removes username and password from a URL.
 * @param unfilteredUrl any URL string
 */
export function filterUrl(unfilteredUrl: string | undefined): string {
  if (!unfilteredUrl) {
    return '';
  }

  const url = new URL(unfilteredUrl);
  url.username = '';
  url.password = '';
  return url.toString();
}

/**
 * Throws the error it receives and if it's an HTTP Error it will convert it to a ClientApiError
 *
 */
export function convertApiErrorsAndThrow(err: any): never {
  if (err.name === 'HTTPError') {
    err = new ClientApiError(err);
  }

  throw err;
}

/**
 * An Error wrapper to provide more useful error information without exposing credentials
 */
export class ClientApiError extends Error {
  public details?: TwilioApiError;
  public code?: number | string;
  public url?: string;

  constructor(requestError: unknown) {
    super('Unknown Error');
    if (requestError instanceof RequestError) {
      const twilioApiErrorInfo = toTwilioApiError(requestError.response?.body);
      const message = twilioApiErrorInfo?.message || requestError.message;
      Error.captureStackTrace(this, this.constructor);
      this.name = requestError.name;
      this.message = message;
      this.code = twilioApiErrorInfo?.code || requestError.response?.statusCode;
      this.url = filterUrl(requestError.response?.requestUrl);

      if (requestError.name === 'HTTPError' && twilioApiErrorInfo) {
        this.name = 'TwilioApiError';
        this.details = {
          ...twilioApiErrorInfo,
        };
      }
    }
  }
}
