import debug from 'debug';
import fastRedact from 'fast-redact';

type RedactorFunction<T extends object> = (val: T) => T;

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
});

export const allPropertiesRedactor = fastRedact({
  paths: ['*'],
});

debug.formatters.P = function protectedFormatterMultiline(v: any): string {
  if (typeof v === 'object') {
    v = JSON.parse(generalRedactor(v));
  }

  return debug.formatters.O.bind(debug)(v);
};

debug.formatters.p = function protectedFormatterSameline(v: any): string {
  if (typeof v === 'object') {
    v = JSON.parse(generalRedactor(v));
  }

  return debug.formatters.o.bind(debug)(v);
};

debug.formatters.R = function redactedFormatterMultiline(v: any): string {
  if (typeof v === 'object') {
    v = JSON.parse(allPropertiesRedactor(v));
  }
  return debug.formatters.O.bind(debug)(v);
};

debug.formatters.r = function redactedFormatterSameline(v: any): string {
  if (typeof v === 'object') {
    v = JSON.parse(allPropertiesRedactor(v));
  }
  return debug.formatters.o.bind(debug)(v);
};
