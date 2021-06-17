export const restrictedHeaderPrefixes = [
  'i-twilio-',
  'i-t-',
  'ot-',
  'x-amz',
  'x-forwarded-',
  'x-accel-',
];

export const restrictedHeaderExactMatches = [
  'via',
  'referer',
  'transfer-encoding',
  'proxy-authorization',
  'proxy-authenticate',
  'x-real-ip',
  'connection',
  'proxy-connection',
  'expect',
  'trailer',
  'upgrade',
];
