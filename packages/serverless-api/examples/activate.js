// This can be run after examples/deploy.js you just need the service Sid.
// Run this example with:
// node deploy/activate.js SERVICE_SID

const { TwilioServerlessApiClient } = require('../dist');
const serviceSid = process.argv[2];
async function run() {
  const config = {
    username: process.env.TWILIO_ACCOUNT_SID,
    password: process.env.TWILIO_AUTH_TOKEN,
  };

  const client = new TwilioServerlessApiClient(config);
  console.log('Activating');
  const result = await client.activateBuild({
    ...config,
    env: {
      HELLO: 'hello',
      WORLD: 'world',
    },
    serviceSid,
    sourceEnvironment: 'test',
    targetEnvironment: 'stage',
    createEnvironment: true,
  });
  console.log('Done Activating');
  console.dir(result);
}

run().catch(console.error);
