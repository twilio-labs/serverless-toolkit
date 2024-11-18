import { Response as ExpressResponse } from 'express';
import { Response } from '../../../src/dev-runtime/internal/response';

test('has correct defaults', () => {
  const response = new Response();
  expect(response['body']).toBeNull();
  expect(response['statusCode']).toBe(200);
  expect(response['headers']).toEqual({
    'Set-Cookie': [],
  });
});

test('sets status code, body and headers from constructor', () => {
  const response = new Response({
    headers: {
      'Access-Control-Allow-Origin': 'example.com',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: 'Error',
    statusCode: 400,
  });
  expect(response['statusCode']).toBe(400);
  expect(response['body']).toBe('Error');
  expect(response['headers']).toEqual({
    'Access-Control-Allow-Origin': 'example.com',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Set-Cookie': [],
  });
});

test('sets status code', () => {
  const response = new Response();
  expect(response['statusCode']).toBe(200);
  response.setStatusCode(418);
  expect(response['statusCode']).toBe(418);
});

test('sets body correctly', () => {
  const response = new Response();
  expect(response['body']).toBeNull();
  response.setBody('Hello');
  expect(response['body']).toBe('Hello');
  response.setBody({ url: 'https://dkundel.com' });
  expect(response['body']).toEqual({ url: 'https://dkundel.com' });
});

test('sets headers correctly', () => {
  const response = new Response();
  expect(response['headers']).toEqual({
    'Set-Cookie': [],
  });
  response.setHeaders({
    'Access-Control-Allow-Origin': 'example.com',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  const expected = {
    'Access-Control-Allow-Origin': 'example.com',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Set-Cookie': [],
  };
  expect(response['headers']).toEqual(expected);
  // @ts-ignore
  response.setHeaders(undefined);
  expect(response['headers']).toEqual(expected);
});

test('sets headers with string cookies', () => {
  const response = new Response();
  expect(response['headers']).toEqual({
    'Set-Cookie': [],
  });
  response.setHeaders({
    'Access-Control-Allow-Origin': 'example.com',
    'Set-Cookie': 'Hi=Bye',
  });
  const expected = {
    'Access-Control-Allow-Origin': 'example.com',
    'Set-Cookie': ['Hi=Bye'],
  };
  expect(response['headers']).toEqual(expected);
});

test('object cant be a header', () => {
  const response = new Response();
  expect(response['headers']).toEqual({
    'Set-Cookie': [],
  });

  expect(() => {
    response.appendHeader('Access-Control-Allow-Origin', {} as any);
  }).toThrow('Header value cannot be an object');
});

test('sets headers with an array of cookies', () => {
  const response = new Response();
  expect(response['headers']).toEqual({
    'Set-Cookie': [],
  });
  response.setHeaders({
    'Access-Control-Allow-Origin': 'example.com',
    'Set-Cookie': ['Hi=Bye', 'Hello=World'],
  });
  const expected = {
    'Access-Control-Allow-Origin': 'example.com',
    'Set-Cookie': ['Hi=Bye', 'Hello=World'],
  };
  expect(response['headers']).toEqual(expected);
});

test('sets cookies with lower case set-cookie', () => {
  const response = new Response();
  expect(response['headers']).toEqual({
    'Set-Cookie': [],
  });
  response.setHeaders({
    'Access-Control-Allow-Origin': 'example.com',
    'set-cookie': ['Hi=Bye', 'Hello=World'],
  });
  const expected = {
    'Access-Control-Allow-Origin': 'example.com',
    'Set-Cookie': ['Hi=Bye', 'Hello=World'],
  };
  expect(response['headers']).toEqual(expected);
});

test('appends a new header correctly', () => {
  const response = new Response();
  expect(response['headers']).toEqual({
    'Set-Cookie': [],
  });
  response.appendHeader('Access-Control-Allow-Origin', 'dkundel.com');
  expect(response['headers']).toEqual({
    'Access-Control-Allow-Origin': 'dkundel.com',
    'Set-Cookie': [],
  });
  response.appendHeader('Content-Type', 'application/json');
  expect(response['headers']).toEqual({
    'Access-Control-Allow-Origin': 'dkundel.com',
    'Content-Type': 'application/json',
    'Set-Cookie': [],
  });
});

test('appends a header correctly with no existing one', () => {
  const response = new Response();
  expect(response['headers']).toEqual({
    'Set-Cookie': [],
  });
  // @ts-ignore
  response['headers'] = undefined;
  response.appendHeader('Access-Control-Allow-Origin', 'dkundel.com');
  expect(response['headers']).toEqual({
    'Access-Control-Allow-Origin': 'dkundel.com',
    'Set-Cookie': [],
  });
});

test('appends multi value headers', () => {
  const response = new Response();
  expect(response['headers']).toEqual({
    'Set-Cookie': [],
  });
  response.appendHeader('Access-Control-Allow-Origin', 'dkundel.com');
  response.appendHeader('Access-Control-Allow-Origin', 'philna.sh');
  response.appendHeader('Access-Control-Allow-Methods', 'GET');
  response.appendHeader('Access-Control-Allow-Methods', 'DELETE');
  response.appendHeader('Access-Control-Allow-Methods', ['PUT', 'POST']);
  expect(response['headers']).toEqual({
    'Access-Control-Allow-Origin': ['dkundel.com', 'philna.sh'],
    'Access-Control-Allow-Methods': ['GET', 'DELETE', 'PUT', 'POST'],
    'Set-Cookie': [],
  });
});

test('sets a single cookie correctly', () => {
  const response = new Response();
  expect(response['headers']).toEqual({
    'Set-Cookie': [],
  });
  response.setCookie('name', 'value');
  expect(response['headers']).toEqual({
    'Set-Cookie': ['name=value'],
  });
});

test('sets a cookie with attributes', () => {
  const response = new Response();
  expect(response['headers']).toEqual({
    'Set-Cookie': [],
  });
  response.setCookie('Hello', 'World', [
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Max-Age=86400',
  ]);
  expect(response['headers']).toEqual({
    'Set-Cookie': ['Hello=World;HttpOnly;Secure;SameSite=Strict;Max-Age=86400'],
  });
});

test('removes a cookie', () => {
  const response = new Response();
  expect(response['headers']).toEqual({
    'Set-Cookie': [],
  });
  response.setCookie('Hello', 'World', [
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Max-Age=86400',
  ]);
  response.removeCookie('Hello');
  expect(response['headers']).toEqual({
    'Set-Cookie': ['Hello=;Max-Age=0'],
  });
});

test('setStatusCode returns the response', () => {
  const response = new Response();
  expect(response.setStatusCode(418)).toBe(response);
});

test('setBody returns the response', () => {
  const response = new Response();
  expect(response.setBody('Hello')).toBe(response);
});

test('setHeader returns the response', () => {
  const response = new Response();
  expect(response.setHeaders({ 'X-Test': 'Hello' })).toBe(response);
});

test('appendHeader returns the response', () => {
  const response = new Response();
  expect(response.appendHeader('X-Test', 'Hello')).toBe(response);
});

test('setCookie returns the response', () => {
  const response = new Response();
  expect(response.setCookie('name', 'value')).toBe(response);
});

test('removeCookie returns the response', () => {
  const response = new Response();
  expect(response.removeCookie('name')).toBe(response);
});

test('calls express response correctly', () => {
  const mockRes = {
    status: jest.fn(),
    set: jest.fn(),
    send: jest.fn(),
  } as unknown as ExpressResponse;
  const response = new Response();
  response.setBody(`I'm a teapot!`);
  response.setStatusCode(418);
  response.appendHeader('Content-Type', 'text/plain');
  response.applyToExpressResponse(mockRes);

  expect(mockRes.send).toHaveBeenCalledWith(`I'm a teapot!`);
  expect(mockRes.status).toHaveBeenCalledWith(418);
  expect(mockRes.set).toHaveBeenCalledWith({
    'Content-Type': 'text/plain',
    'Set-Cookie': [],
  });
});

test('serializes a response', () => {
  const response = new Response();
  response.setBody("I'm a teapot!");
  response.setStatusCode(418);
  response.appendHeader('Content-Type', 'text/plain');

  const serialized = response.serialize();

  expect(serialized.body).toEqual("I'm a teapot!");
  expect(serialized.statusCode).toEqual(418);
  expect(serialized.headers).toEqual({
    'Content-Type': 'text/plain',
    'Set-Cookie': [],
  });
});

test('serializes a response with content type set to application/json', () => {
  const response = new Response();
  response.setBody({ url: 'https://dkundel.com' });
  response.setStatusCode(200);
  response.appendHeader('Content-Type', 'application/json');

  const serialized = response.serialize();

  expect(serialized.body).toEqual(
    JSON.stringify({ url: 'https://dkundel.com' })
  );
  expect(serialized.statusCode).toEqual(200);
  expect(serialized.headers).toEqual({
    'Content-Type': 'application/json',
    'Set-Cookie': [],
  });
});

test('serializes a response with content type set to application/json with a charset', () => {
  const response = new Response();
  response.setBody({ url: 'https://dkundel.com' });
  response.setStatusCode(200);
  response.appendHeader('Content-Type', 'application/json; charset=UTF-8');

  const serialized = response.serialize();

  expect(serialized.body).toEqual(
    JSON.stringify({ url: 'https://dkundel.com' })
  );
  expect(serialized.statusCode).toEqual(200);
  expect(serialized.headers).toEqual({
    'Content-Type': 'application/json; charset=UTF-8',
    'Set-Cookie': [],
  });
});
