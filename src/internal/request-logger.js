const chalk = require('chalk');
const { stripIndent } = require('common-tags');

function simpleLogs(req, res) {
  const contentType = res.get('Content-Type');
  const responseCode =
    res.statusCode >= 400
      ? chalk`{black.bgRed ${res.statusCode}}`
      : res.statusCode < 300
      ? chalk`{black.bgGreen ${res.statusCode}}`
      : chalk`{black.bgYellow ${res.statusCode}}`;
  let msg = chalk`
  ${responseCode} {bold ${req.method}} ${
    req.originalUrl
  }`;

  if (contentType) {
    msg += chalk` │ {dim Response Type ${contentType}}`
  }

  return stripIndent`${msg}`;
}

function detailedLogs(req, res) {
  debugger;
  const msgLines = [chalk`{reset }`, simpleLogs(req, res)];
  let body;
  const bodyEntries = Object.entries(req.body);
  if (bodyEntries.length > 0) {
    const lines = bodyEntries
      .map(([key, value]) => chalk`│    ${key}: {bold ${value}}`)
      .join('\n');
    body = `│  Body:\n${lines}`;
  }
  let query;
  const queryEntries = Object.entries(req.query);
  if (queryEntries.length > 0) {
    const lines = queryEntries
      .map(([key, value]) => chalk`│    ${key}: {bold ${value}}`)
      .join(chalk.reset() + '\n');
    query = `│  Query:\n${lines}`;
  }

  if (body || query) {
    msgLines.push(chalk`│{underline Request:}`, query, body);
  }

  return msgLines.filter(x => !!x).join('\n');
}

function createLogger(config) {
  return function requestLogger(req, res, next) {
    const resEnd = res.end.bind(res);
    res.end = function sendInterceptor(...args) {
      const msg = config.detailedLogs
        ? detailedLogs(req, res)
        : simpleLogs(req, res);
      console.log(msg);
      resEnd(...args);
    };
    next();
  };
}

module.exports = { createLogger };
