test('base export includes Response class', () => {
  const { Response } = require('..');
  expect(Response).toBeDefined();
  expect(typeof Response).toBe('function');

  const res = new Response();
  expect(res.setStatusCode).toBeDefined();
  expect(res.setBody).toBeDefined();
  expect(res.appendHeader).toBeDefined();
  expect(res.setCookie).toBeDefined();
});
