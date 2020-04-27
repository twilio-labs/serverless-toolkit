const { TwilioServerlessApiClient } = require('../dist');
async function run() {
  const config = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  };

  const client = new TwilioServerlessApiClient(config);
  console.log('Deploying');
  const result = await client.deployProject({
    ...config,
    overrideExistingService: true,
    env: {
      HELLO: 'ahoy',
      WORLD: 'welt',
    },
    pkgJson: {
      dependencies: {
        'common-tags': '*',
        'date-fns': '*',
      },
    },
    serviceName: 'api-demo',
    functionsEnv: 'test',
    functions: [
      {
        name: 'hello-world',
        path: '/hello-world',
        content: `
          const { stripIndent } = require('common-tags');
          const { format } = require('date-fns');
          exports.handler = function(context, event, callback) {
            callback(null, stripIndent\`
              \${context.HELLO} \${context.WORLD} \${format(new Date(2010, 4, 10), 'yyyy-MM-dd')}
            \`);
          };
        `,
        access: 'public',
      },
    ],
    assets: [
      {
        name: 'my-lib.js',
        path: '/my-lib.js',
        access: 'public',
        content: 'exports.sum = (a, b) => a+b',
      },
    ],
  });
  console.log('Done Deploying');
  console.dir(result);
}

run().catch(console.error);
