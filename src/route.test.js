const {
  VoiceResponse,
  MessagingResponse,
  FaxResponse,
} = require('twilio').twiml;
const {
  handleError,
  handleSuccess,
  constructEvent,
  isTwiml,
  constructContext,
  constructGlobalScope,
} = require('./route');
const { Response } = require('./internal/response');
const Runtime = require('./internal/runtime');
const { Response: MockResponse } = require('jest-express/lib/response');

const mockResponse = new MockResponse();
mockResponse.type = jest.fn(() => mockResponse);

describe('handleError function', () => {
  test('calls correct response methods', () => {
    handleError('Failed to execute', mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith('Failed to execute');
  });
});

describe('constructEvent function', () => {
  test('merges query and body', () => {
    const event = constructEvent({
      body: {
        Body: 'Hello',
      },
      query: {
        index: 5,
      },
    });
    expect(event).toEqual({ Body: 'Hello', index: 5 });
  });

  test('overrides query with body', () => {
    const event = constructEvent({
      body: {
        Body: 'Bye',
      },
      query: {
        Body: 'Hello',
        From: '+123456789',
      },
    });
    expect(event).toEqual({ Body: 'Bye', From: '+123456789' });
  });

  test('handles empty body', () => {
    const event = constructEvent({
      body: {},
      query: {
        Body: 'Hello',
        From: '+123456789',
      },
    });
    expect(event).toEqual({ Body: 'Hello', From: '+123456789' });
  });

  test('handles empty query', () => {
    const event = constructEvent({
      body: {
        Body: 'Hello',
        From: '+123456789',
      },
      query: {},
    });
    expect(event).toEqual({ Body: 'Hello', From: '+123456789' });
  });

  test('handles both empty', () => {
    const event = constructEvent({
      body: {},
      query: {},
    });
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
        ACCOUNT_SID: 'ACxxxxxxxxxxx',
        AUTH_TOKEN: 'xyz',
      },
    };
    const context = constructContext(config);
    expect(context.DOMAIN_NAME).toBe('http://localhost:8000');
    expect(context.ACCOUNT_SID).toBe('ACxxxxxxxxxxx');
    expect(context.AUTH_TOKEN).toBe('xyz');
    expect(typeof context.getTwilioClient).toBe('function');
  });

  test('getTwilioClient calls twilio constructor', () => {
    const ACCOUNT_SID = 'ACxxxxx';
    const AUTH_TOKEN = 'xyz';

    const config = {
      url: 'http://localhost:8000',
      env: { ACCOUNT_SID, AUTH_TOKEN },
    };
    const context = constructContext(config);
    const twilioFn = require('twilio');
    context.getTwilioClient();
    expect(twilioFn).toHaveBeenCalledWith('ACxxxxx', 'xyz');
  });
});

describe('constructGlobalScope function', () => {
  beforeEach(() => {
    global['Twilio'] = undefined;
    global['Runtime'] = undefined;
  });

  afterEach(() => {
    global['Twilio'] = undefined;
    global['Runtime'] = undefined;
  });

  test('sets the correct global variables', () => {
    expect(global.Twilio).toBeUndefined();
    expect(global.Runtime).toBeUndefined();
    constructGlobalScope();
    const twilio = require('twilio');
    expect(global.Twilio).toEqual({ ...twilio, Response });
    expect(global.Runtime).toEqual(Runtime);
  });
});

describe('handleSuccess function', () => {
  test('handles string responses', () => {
    handleSuccess('Yay', mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith('Yay');
    expect(mockResponse.type).not.toHaveBeenCalled();
  });

  test('handles string responses', () => {
    handleSuccess('Yay', mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith('Yay');
    expect(mockResponse.type).not.toHaveBeenCalled();
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
