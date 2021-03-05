jest.mock('window-size');

import '@twilio-labs/serverless-runtime-types';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { twiml } from 'twilio';
import { StartCliConfig } from '../../src/config/start';
import { Response } from '../../src/runtime/internal/response';
import {
  constructContext,
  constructEvent,
  constructGlobalScope,
  handleError,
  handleSuccess,
  isTwiml,
} from '../../src/runtime/route';
import { EnvironmentVariablesWithAuth } from '../../src/types/generic';
import { wrapErrorInHtml } from '../../src/utils/error-html';
import { cleanUpStackTrace } from '../../src/utils/stack-trace/clean-up';

const { VoiceResponse, MessagingResponse, FaxResponse } = twiml;

const mockResponse = (new MockResponse() as unknown) as ExpressResponse;
mockResponse.type = jest.fn(() => mockResponse);

function asExpressRequest(req: { query?: {}; body?: {} }): ExpressRequest {
  return (req as unknown) as ExpressRequest;
}

describe('handleError function', () => {
  test('returns string error', () => {
    const mockRequest = (new MockRequest() as unknown) as ExpressRequest;
    mockRequest['useragent'] = {
      isDesktop: true,
      isMobile: false,
    } as ExpressUseragent.UserAgent;

    handleError('string error', mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith('string error');
  });

  test('handles objects as error argument', () => {
    const mockRequest = (new MockRequest() as unknown) as ExpressRequest;
    mockRequest['useragent'] = {
      isDesktop: true,
      isMobile: false,
    } as ExpressUseragent.UserAgent;

    handleError({ errorMessage: 'oh no' }, mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith({ errorMessage: 'oh no' });
  });

  test('wraps error object for desktop requests', () => {
    const mockRequest = (new MockRequest() as unknown) as ExpressRequest;
    mockRequest['useragent'] = {
      isDesktop: true,
      isMobile: false,
    } as ExpressUseragent.UserAgent;

    const err = new Error('Failed to execute');
    handleError(err, mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith(wrapErrorInHtml(err));
  });

  test('wraps error object for mobile requests', () => {
    const mockRequest = (new MockRequest() as unknown) as ExpressRequest;
    mockRequest['useragent'] = {
      isDesktop: false,
      isMobile: true,
    } as ExpressUseragent.UserAgent;

    const err = new Error('Failed to execute');
    handleError(err, mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith(wrapErrorInHtml(err));
  });

  test('returns string version of error for other requests', () => {
    const mockRequest = (new MockRequest() as unknown) as ExpressRequest;
    mockRequest['useragent'] = {
      isDesktop: false,
      isMobile: false,
    } as ExpressUseragent.UserAgent;

    const err = new Error('Failed to execute');
    const cleanedupError = cleanUpStackTrace(err);
    handleError(err, mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: 'Failed to execute',
      name: 'Error',
      stack: cleanedupError.stack,
    });
  });
});

describe('constructEvent function', () => {
  test('merges query and body', () => {
    const event = constructEvent(
      asExpressRequest({
        body: {
          Body: 'Hello',
        },
        query: {
          index: 5,
        },
      })
    );
    expect(event).toEqual({ Body: 'Hello', index: 5 });
  });

  test('overrides query with body', () => {
    const event = constructEvent(
      asExpressRequest({
        body: {
          Body: 'Bye',
        },
        query: {
          Body: 'Hello',
          From: '+123456789',
        },
      })
    );
    expect(event).toEqual({ Body: 'Bye', From: '+123456789' });
  });

  test('handles empty body', () => {
    const event = constructEvent(
      asExpressRequest({
        body: {},
        query: {
          Body: 'Hello',
          From: '+123456789',
        },
      })
    );
    expect(event).toEqual({ Body: 'Hello', From: '+123456789' });
  });

  test('handles empty query', () => {
    const event = constructEvent(
      asExpressRequest({
        body: {
          Body: 'Hello',
          From: '+123456789',
        },
        query: {},
      })
    );
    expect(event).toEqual({ Body: 'Hello', From: '+123456789' });
  });

  test('handles both empty', () => {
    const event = constructEvent(
      asExpressRequest({
        body: {},
        query: {},
      })
    );
    expect(event).toEqual({});
  });
});

describe('isTwiml', () => {
  test('detects Voice TwiML correctly', () => {
    const twiml = new VoiceResponse();
    expect(isTwiml(twiml)).toBeTruthy();
  });

  test('detects Messaging TwiML correctly', () => {
    const twiml = new MessagingResponse();
    expect(isTwiml(twiml)).toBeTruthy();
  });

  test('detects Fax TwiML correctly', () => {
    const twiml = new FaxResponse();
    expect(isTwiml(twiml)).toBeTruthy();
  });

  test('detects invalid object', () => {
    const notTwiml = new Date();
    expect(isTwiml(notTwiml)).toBeFalsy();
    const alsoNotTwiml = {};
    expect(isTwiml(alsoNotTwiml)).toBeFalsy();
  });
});

describe('constructContext function', () => {
  test('returns correct values', () => {
    const config = {
      url: 'http://localhost:8000',
      env: {
        ACCOUNT_SID: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        AUTH_TOKEN: 'authauthauthauthauthauthauthauth',
      },
    } as StartCliConfig;
    const context = constructContext(config, '/test');
    expect(context.DOMAIN_NAME).toBe('localhost:8000');
    expect(context.PATH).toBe('/test');
    expect(context.ACCOUNT_SID).toBe('ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    expect(context.AUTH_TOKEN).toBe('authauthauthauthauthauthauthauth');
    expect(typeof context.getTwilioClient).toBe('function');
  });

  test('does not override existing PATH values', () => {
    const env: EnvironmentVariablesWithAuth = {
      ACCOUNT_SID: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      AUTH_TOKEN: 'authauthauthauthauthauthauthauth',
      PATH: '/usr/bin:/bin',
    };

    const config = {
      url: 'http://localhost:8000',
      env,
    } as StartCliConfig;
    const context = constructContext(config, '/test2');
    expect(context.PATH).toBe('/usr/bin:/bin');
  });

  test('does not override existing DOMAIN_NAME values', () => {
    const env: EnvironmentVariablesWithAuth = {
      ACCOUNT_SID: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      AUTH_TOKEN: 'authauthauthauthauthauthauthauth',
      DOMAIN_NAME: 'hello.world',
    };

    const config = {
      url: 'http://localhost:8000',
      env,
    } as StartCliConfig;
    const context = constructContext(config, '/test2');
    expect(context.DOMAIN_NAME).toBe('hello.world');
  });

  test('getTwilioClient calls twilio constructor', () => {
    const ACCOUNT_SID = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const AUTH_TOKEN = 'authauthauthauthauthauthauthauth';

    const config = {
      url: 'http://localhost:8000',
      env: { ACCOUNT_SID, AUTH_TOKEN },
    } as StartCliConfig;
    const context = constructContext(config, '/test');
    const twilioFn = require('twilio');
    context.getTwilioClient();
    expect(twilioFn).toHaveBeenCalledWith(
      'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'authauthauthauthauthauthauthauth'
    );
  });
});

describe('constructGlobalScope function', () => {
  const ACCOUNT_SID = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  const AUTH_TOKEN = 'authauthauthauthauthauthauthauth';
  let config: StartCliConfig;

  function resetGlobals() {
    // @ts-ignore
    global['Twilio'] = undefined;
    // @ts-ignore
    global['Runtime'] = undefined;
    // @ts-ignore
    global['Response'] = undefined;
    // @ts-ignore
    global['twilioClient'] = null;
    // @ts-ignore
    global['Functions'] = undefined;
  }

  beforeEach(() => {
    config = {
      url: 'http://localhost:8000',
      env: { ACCOUNT_SID, AUTH_TOKEN },
    } as StartCliConfig;
    resetGlobals();
  });

  afterEach(() => {
    config = {} as StartCliConfig;
    resetGlobals();
  });

  test('sets the correct global variables', () => {
    expect(global.Twilio).toBeUndefined();
    expect(global.Runtime).toBeUndefined();
    expect(global.Response).toBeUndefined();
    expect(global.twilioClient).toBeNull();
    expect(global.Functions).toBeUndefined();
    constructGlobalScope(config);

    const twilio = require('twilio');

    expect(global.Twilio).toEqual({ ...twilio, Response });
    expect(typeof global.Runtime.getAssets).toBe('function');
    expect(typeof global.Runtime.getFunctions).toBe('function');
    expect(typeof global.Runtime.getSync).toBe('function');
    expect(Response).toEqual(Response);
    expect(twilioClient).not.toBeNull();
    expect(global.Functions).not.toBeUndefined();
  });
});

describe('handleSuccess function', () => {
  test('handles string responses', () => {
    handleSuccess('Yay', mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith('Yay');
    expect(mockResponse.type).toHaveBeenCalledWith('text/plain');
  });

  test('handles twiml responses', () => {
    const twiml = new MessagingResponse();
    twiml.message('Hello');
    handleSuccess(twiml, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(twiml.toString());
    expect(mockResponse.type).toHaveBeenCalledWith('text/xml');
  });

  test('handles Response instances', () => {
    const resp = new Response();
    resp.setBody({ data: 'Something' });
    resp.setStatusCode(418);
    resp.setHeaders({
      'Content-Type': 'application/json',
    });
    handleSuccess(resp, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(418);
    expect(mockResponse.send).toHaveBeenCalledWith({ data: 'Something' });
    expect(mockResponse.set).toHaveBeenCalledWith({
      'Content-Type': 'application/json',
    });
    expect(mockResponse.type).not.toHaveBeenCalled();
  });

  test('sends plain objects', () => {
    const data = { values: [1, 2, 3] };
    handleSuccess(data, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith({ values: [1, 2, 3] });
    expect(mockResponse.type).not.toHaveBeenCalled();
  });
});
