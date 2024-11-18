import { Response } from '../../../src/runtime/internal/response';
import { Response as ExpressResponse } from 'express';

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
  };
  expect(response['headers']).toEqual(expected);
  // @ts-ignore
  response.setHeaders(undefined);
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

test('object cant be a header', () => {
  const response = new Response();
  expect(response['headers']).toEqual({
    'Set-Cookie': [],
  });

  expect(() => {
    response.appendHeader('Access-Control-Allow-Origin', {} as any);
  }).toThrow('Header value cannot be an object');
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
