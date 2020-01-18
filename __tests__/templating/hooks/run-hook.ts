jest.unmock('twilio');
import { stripIndent } from 'common-tags';
import { runHook } from '../../../src/templating/hooks/run-hook';

const EXAMPLE_HOOK = stripIndent`
  async function postinstall(client, env) {
    const services = await client.serverless.services.list();
    return {
      env: {
        SERVICE_SID: services[0].sid
      }
    }
  }
  module.exports = { postinstall }
`;

describe('runPostInstallHook', () => {
  test('runs', async () => {
    const output = await runHook(
      'postinstall',
      EXAMPLE_HOOK,
      {
        DATABASE_URL: 'http://localhost:3000',
      },
      console
    );
    expect(true).toBeTruthy();
  });
});
