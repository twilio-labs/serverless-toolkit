import { getUrl, StartCliFlags } from '../../src/config/start';

jest.mock('ngrok', () => {
  throw new Error("Cannot find module 'ngrok'");
});

describe('getUrl', () => {
  test('calls ngrok if ngrok is defined', async () => {
    const config = ({
      ngrok: '',
    } as unknown) as StartCliFlags;

    expect.assertions(1);
    try {
      await getUrl(config, 3000);
    } catch (error) {
      expect(error.message).toMatch("Cannot find module 'ngrok'");
    }
  });

  test('calls ngrok with custom subdomain if passed', async () => {
    const config = ({
      ngrok: 'dom',
    } as unknown) as StartCliFlags;

    expect.assertions(1);
    try {
      await getUrl(config, 3000);
    } catch (error) {
      expect(error.message).toMatch("Cannot find module 'ngrok'");
    }
  });
});
