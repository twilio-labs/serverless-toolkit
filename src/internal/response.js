const debug = require('debug')('twilio-run:response');

class Response {
  constructor() {
    this.body = undefined;
    this.statusCode = 200;
    this.headers = {};
  }
  setStatusCode(statusCode) {
    debug('Setting status code to %d', statusCode);
    this.statusCode = statusCode;
  }

  setBody(body) {
    debug('Setting response body to %o', body);
    this.body = body;
  }

  setHeaders(headersObject) {
    debug('Setting headers to: %O', headersObject);
    this.headers = headersObject;
  }

  appendHeader(key, value) {
    debug('Appending header for %s as %s', key, value);
    this.headers = this.headers || {};
    this.headers[key] = value;
  }

  applyToExpressResponse(res) {
    debug('Setting values on response: %O', {
      statusCode: this.statusCode,
      headers: this.headers,
      body: this.body
    });
    res.status(this.statusCode);
    res.set(this.headers);
    res.send(this.body);
  }
}

module.exports = { Response };
