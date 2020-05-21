let retryLimit = process.env.TWILIO_SERVERLESS_API_RETRY_LIMIT;
if (typeof retryLimit === 'undefined') {
  retryLimit = '10';
}

let concurrency = process.env.TWILIO_SERVERLESS_API_CONCURRENCY;
if (typeof concurrency === 'undefined') {
  concurrency = '50';
}

export const RETRY_LIMIT = parseInt(retryLimit, 10);
export const CONCURRENCY = parseInt(concurrency, 10);
