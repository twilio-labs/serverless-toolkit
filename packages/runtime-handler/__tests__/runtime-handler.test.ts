'use strict';

const runtimeHandler = require('..');

describe('@twilio/runtime-handler', () => {
  test('exports nothing', () => {
    expect(runtimeHandler).toEqual({});
  });
});
