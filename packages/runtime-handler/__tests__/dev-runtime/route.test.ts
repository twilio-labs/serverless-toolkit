jest.mock('../../../../node_modules/twilio', () => {
  // because we don't do a traditional require of twilio but a "project require" we have to mock this differently.

  const actualTwilio = jest.requireActual('twilio');
  const twilio: any = jest.genMockFromModule('twilio');

  twilio['twiml'] = actualTwilio.twiml;
  return twilio;
});

import '@twilio-labs/serverless-runtime-types';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import type { UserAgent } from 'express-useragent';
import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import path from 'path';
import { twiml } from 'twilio';
import { Response } from '../../src/dev-runtime/internal/response';
import {
  constructContext,
  constructEvent,
  constructHeaders,
  constructGlobalScope,
  handleError,
  handleSuccess,
  isTwiml,
} from '../../src/dev-runtime/route';
import {
  EnvironmentVariablesWithAuth,
  ServerConfig,
} from '../../src/dev-runtime/types';
import { wrapErrorInHtml } from '../../src/dev-runtime/utils/error-html';
import { requireFromProject } from '../../src/dev-runtime/utils/requireFromProject';
import { cleanUpStackTrace } from '../../src/dev-runtime/utils/stack-trace/clean-up';

const { VoiceResponse, MessagingResponse, FaxResponse } = twiml;

const mockResponse = new MockResponse() as unknown as ExpressResponse;
mockResponse.type = jest.fn(() => mockResponse);

function asExpressRequest(req: {
  query?: {};
  body?: {};
  rawHeaders?: string[];
  cookies?: {};
}): ExpressRequest {
  return req as unknown as ExpressRequest;
}

describe('handleError function', () => {
  test('returns string error', () => {
    const mockRequest = new MockRequest() as unknown as ExpressRequest;
    mockRequest['useragent'] = {
      isDesktop: true,
      isMobile: false,
    } as UserAgent;

    handleError('string error', mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith('string error');
  });

  test('handles objects as error argument', () => {
    const mockRequest = new MockRequest() as unknown as ExpressRequest;
    mockRequest['useragent'] = {
      isDesktop: true,
      isMobile: false,
    } as UserAgent;

    handleError({ errorMessage: 'oh no' }, mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith({ errorMessage: 'oh no' });
  });

  test('wraps error object for desktop requests', () => {
    const mockRequest = new MockRequest() as unknown as ExpressRequest;
    mockRequest['useragent'] = {
      isDesktop: true,
      isMobile: false,
    } as UserAgent;

    const err = new Error('Failed to execute');
    handleError(err, mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith(wrapErrorInHtml(err));
  });

  test('wraps error object for mobile requests', () => {
    const mockRequest = new MockRequest() as unknown as ExpressRequest;
    mockRequest['useragent'] = {
      isDesktop: false,
      isMobile: true,
    } as UserAgent;

    const err = new Error('Failed to execute');
    handleError(err, mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith(wrapErrorInHtml(err));
  });

  test('returns string version of error for other requests', () => {
    const mockRequest = new MockRequest() as unknown as ExpressRequest;
    mockRequest['useragent'] = {
      isDesktop: false,
      isMobile: false,
    } as UserAgent;

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
    expect(event).toEqual({
      Body: 'Hello',
      index: 5,
      request: { headers: {}, cookies: {} },
    });
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
    expect(event).toEqual({
      Body: 'Bye',
      From: '+123456789',
      request: { headers: {}, cookies: {} },
    });
  });

  test('does not override request', () => {
    const event = constructEvent(
      asExpressRequest({
        body: {
          Body: 'Bye',
        },
        query: {
          request: 'Hello',
        },
      })
    );
    expect(event).toEqual({
      Body: 'Bye',
      request: 'Hello',
    });
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
    expect(event).toEqual({
      Body: 'Hello',
      From: '+123456789',
      request: { headers: {}, cookies: {} },
    });
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
    expect(event).toEqual({
      Body: 'Hello',
      From: '+123456789',
      request: { headers: {}, cookies: {} },
    });
  });

  test('handles both empty', () => {
    const event = constructEvent(
      asExpressRequest({
        body: {},
        query: {},
      })
    );
    expect(event).toEqual({ request: { headers: {}, cookies: {} } });
  });

  test('adds headers to request property', () => {
    const event = constructEvent(
      asExpressRequest({
        body: {},
        query: {},
        rawHeaders: ['x-test', 'example'],
      })
    );
    expect(event).toEqual({
      request: { headers: { 'x-test': 'example' }, cookies: {} },
    });
  });

  test('adds cookies to request property', () => {
    const event = constructEvent(
      asExpressRequest({
        body: {},
        query: {},
        rawHeaders: [],
        cookies: { flavour: 'choc chip' },
      })
    );
    expect(event).toEqual({
      request: { headers: {}, cookies: { flavour: 'choc chip' } },
    });
  });
});

describe('constructHeaders function', () => {
  test('handles undefined', () => {
    const headers = constructHeaders();
    expect(headers).toEqual({});
  });
  test('handles an empty array', () => {
    const headers = constructHeaders([]);
    expect(headers).toEqual({});
  });
  test('it handles a single header value', () => {
    const headers = constructHeaders(['x-test', 'hello, world']);
    expect(headers).toEqual({ 'x-test': 'hello, world' });
  });
  test('it handles a duplicated header value', () => {
    const headers = constructHeaders([
      'x-test',
      'hello, world',
      'x-test',
      'ahoy',
    ]);
    expect(headers).toEqual({ 'x-test': ['hello, world', 'ahoy'] });
  });
  test('it handles a duplicated header value multiple times', () => {
    const headers = constructHeaders([
      'x-test',
      'hello, world',
      'x-test',
      'ahoy',
      'x-test',
      'third',
    ]);
    expect(headers).toEqual({ 'x-test': ['hello, world', 'ahoy', 'third'] });
  });
  test('it strips restricted headers', () => {
    const headers = constructHeaders([
      'x-test',
      'hello, world',
      'I-Twilio-Test',
      'nope',
    ]);
    expect(headers).toEqual({ 'x-test': 'hello, world' });
  });
  test('it lowercases and combines header names', () => {
    const headers = constructHeaders([
      'X-Test',
      'hello, world',
      'X-test',
      'ahoy',
      'x-test',
      'third',
    ]);
    expect(headers).toEqual({
      'x-test': ['hello, world', 'ahoy', 'third'],
    });
  });

  test("it doesn't pass on restricted headers", () => {
    const headers = constructHeaders([
      'I-Twilio-Example',
      'example',
      'I-T-Example',
      'example',
      'OT-Example',
      'example',
      'x-amz-example',
      'example',
      'via',
      'example',
      'Referer',
      'example.com',
      'transfer-encoding',
      'example',
      'proxy-authorization',
      'example',
      'proxy-authenticate',
      'example',
      'x-forwarded-example',
      'example',
      'x-real-ip',
      'example',
      'connection',
      'example',
      'proxy-connection',
      'example',
      'expect',
      'example',
      'trailer',
      'example',
      'upgrade',
      'example',
      'x-accel-example',
      'example',
      'x-actual-header',
      'this works',
    ]);
    expect(headers).toEqual({
      'x-actual-header': 'this works',
    });
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
      baseDir: path.resolve(__dirname, '../../'),
    } as ServerConfig;
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
      baseDir: path.resolve(__dirname, '../../'),
    } as ServerConfig;
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
      baseDir: path.resolve(__dirname, '../../'),
    } as ServerConfig;
    const context = constructContext(config, '/test2');
    expect(context.DOMAIN_NAME).toBe('hello.world');
  });

  test('getTwilioClient calls twilio constructor', () => {
    const ACCOUNT_SID = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const AUTH_TOKEN = 'authauthauthauthauthauthauthauth';

    const config = {
      url: 'http://localhost:8000',
      env: { ACCOUNT_SID, AUTH_TOKEN },
      baseDir: path.resolve(__dirname, '../../'),
    } as ServerConfig;
    const context = constructContext(config, '/test');
    const twilioFn = requireFromProject(config.baseDir, 'twilio');
    context.getTwilioClient();
    expect(twilioFn).toHaveBeenCalledWith(
      'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'authauthauthauthauthauthauthauth',
      { lazyLoading: true }
    );
  });
});

describe('constructGlobalScope function', () => {
  const ACCOUNT_SID = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  const AUTH_TOKEN = 'authauthauthauthauthauthauthauth';
  let config: ServerConfig;

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
      baseDir: path.resolve(__dirname, '../../'),
    } as ServerConfig;
    resetGlobals();
  });

  afterEach(() => {
    config = {} as ServerConfig;
    resetGlobals();
  });

  test('sets the correct global variables', () => {
    expect(global.Twilio).toBeUndefined();
    expect(global.Runtime).toBeUndefined();
    expect(global.Response).toBeUndefined();
    expect(global.twilioClient).toBeNull();
    expect(global.Functions).toBeUndefined();
    constructGlobalScope(config);

    const twilio = requireFromProject(config.baseDir, 'twilio');

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
      'Set-Cookie': [],
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
