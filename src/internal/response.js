class Response {
  constructor() {
    this.body = undefined;
    this.statusCode = 200;
    this.headers = {};
  }
  setStatusCode(statusCode) {
    this.statusCode = statusCode;
  }

  setBody(body) {
    this.body = body;
  }

  setHeaders(headersObject) {
    this.headers = headersObject;
  }

  appendHeader(key, value) {
    this.headers = this.headers || {};
    this.headers[key] = value;
  }

  applyToExpressResponse(res) {
    res.status(this.statusCode);
    res.set(this.headers);
    res.send(this.body);
  }
}

module.exports = { Response };
