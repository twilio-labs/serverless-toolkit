import chalk from 'chalk';
import { stripIndent } from 'common-tags';
import { Request, Response, RequestHandler } from 'express';
import { StartCliConfig } from '../cli/config';

function simpleLogs(req: Request, res: Response): string {
  const contentType = res.get('Content-Type');
  const responseCode =
    res.statusCode >= 400
      ? chalk`{black.bgRed ${res.statusCode}}`
      : res.statusCode < 300
      ? chalk`{black.bgGreen ${res.statusCode}}`
      : chalk`{black.bgYellow ${res.statusCode}}`;
  let msg = chalk`
  ${responseCode} {bold ${req.method}} ${req.originalUrl}`;

  if (contentType) {
    msg += chalk` │ {dim Response Type ${contentType}}`;
  }

  return stripIndent`${msg}`;
}

function detailedLogs(req: Request, res: Response): string {
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

export function createLogger(config: StartCliConfig): RequestHandler {
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
