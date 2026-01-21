import { getUrl, StartCliFlags } from '../../src/config/start';

jest.mock(
  '@ngrok/ngrok',
  () => {
    throw new Error("Cannot find module '@ngrok/ngrok'");
  },
  { virtual: true }
);

describe('getUrl', () => {
  test('calls ngrok if ngrok is defined', async () => {
    const config = {
      ngrok: '',
    } as unknown as StartCliFlags;

    expect.assertions(1);
    try {
      await getUrl(config, 3000);
    } catch (error) {
      expect(error.message).toMatch(
        '@ngrok/ngrok could not be started because the module is not installed. Please install optional dependencies and try again.'
      );
    }
  });

  test('calls ngrok with custom subdomain if passed', async () => {
    const config = {
      ngrok: 'dom',
    } as unknown as StartCliFlags;

    expect.assertions(1);
    try {
      await getUrl(config, 3000);
    } catch (error) {
      expect(error.message).toMatch(
        '@ngrok/ngrok could not be started because the module is not installed. Please install optional dependencies and try again.'
      );
    }
  });
});
