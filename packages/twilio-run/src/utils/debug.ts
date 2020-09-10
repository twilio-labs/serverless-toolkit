import debug from 'debug';
import fastRedact from 'fast-redact';

function prefixAllEntriesWithWildcard(values: string[]): string[] {
  const result = [];

  for (let val of values) {
    result.push(val);
    result.push(`*.${val}`);
  }

  return result;
}

export const generalRedactor = fastRedact({
  paths: [
    'env.*',
    'pkgJson.*',
    ...prefixAllEntriesWithWildcard([
      'authToken',
      'apiSecret',
      'username',
      'password',
      'cookies',
      'AUTH_TOKEN',
      'API_SECRET',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_API_SECRET',
    ]),
  ],
  serialize: false,
}) as <T>(x: T) => T;

export const allPropertiesRedactor = fastRedact({
  paths: ['*'],
  serialize: false,
}) as <T>(x: T) => T;

export function copyObject(obj: object) {
  return JSON.parse(JSON.stringify(obj));
}

export function createRedactedObject(
  obj: object,
  redactor: typeof generalRedactor
) {
  const copiedObject = copyObject(obj);
  return redactor(copiedObject);
}

debug.formatters.P = function protectedFormatterMultiline(v: any): string {
  if (typeof v === 'object') {
    v = createRedactedObject(v, generalRedactor);
  }

  return debug.formatters.O.bind(debug)(v);
};

debug.formatters.p = function protectedFormatterSameline(v: any): string {
  if (typeof v === 'object') {
    v = createRedactedObject(v, generalRedactor);
  }

  return debug.formatters.o.bind(debug)(v);
};

debug.formatters.R = function redactedFormatterMultiline(v: any): string {
  if (typeof v === 'object') {
    v = createRedactedObject(v, allPropertiesRedactor);
  }
  return debug.formatters.O.bind(debug)(v);
};

debug.formatters.r = function redactedFormatterSameline(v: any): string {
  if (typeof v === 'object') {
    v = createRedactedObject(v, allPropertiesRedactor);
  }
  return debug.formatters.o.bind(debug)(v);
};

export default debug;
