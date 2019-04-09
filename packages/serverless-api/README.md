

# `@twilio-labs/serverless-api`

##  ⚠️ **IMPORTANT**

This is a module for an experimental API that is still in preview mode. 

You won't be able to use this library unless you have been granted prior access to the underlying API.

## Installation

```bash
npm install @twilio-labs/serverless-api
```

## Example

```js
const TwilioServerlessApiClient = require('@twilio-labs/serverless-api');

const client = new TwilioServerlessApiClient({
  cwd: '...';
  envPath: '...';
  accountSid: '...';
  authToken: '...';
  env: {  };
  pkgJson: {};
  projectName: 'serverless-example';
  functionsEnv: 'dev';
});
client.on('status-update', evt => {
  console.log(evt.message);
});
const result = await client.deployLocalProject();
```

## License

MIT

## Contributors

- Dominik Kundel <hi@dominik.dev>