const { getPaths } = require('./runtime-paths');

test('returns the correct paths for passed baseDir', () => {
  const { ASSETS_PATH, FUNCTIONS_PATH } = getPaths('/some/random/path');
  expect(ASSETS_PATH).toBe('/some/random/path/assets');
  expect(FUNCTIONS_PATH).toBe('/some/random/path/functions');
});

test('sets env variable if passed a baseDir', () => {
  process.env.LOCAL_TWILIO_FUNCTIONS_PATH = '';
  getPaths('/some/other/path');
  expect(process.env.LOCAL_TWILIO_FUNCTIONS_PATH).toBe('/some/other/path');
});

test('does not override the env variable if already set', () => {
  process.env.LOCAL_TWILIO_FUNCTIONS_PATH = '/yet/another/path';
  getPaths('/an/amazing/path');
  expect(process.env.LOCAL_TWILIO_FUNCTIONS_PATH).toBe('/yet/another/path');
});

test('uses env variable without baseDir', () => {
  process.env.LOCAL_TWILIO_FUNCTIONS_PATH = '/tmp/dir';
  const { ASSETS_PATH, FUNCTIONS_PATH } = getPaths();
  expect(ASSETS_PATH).toBe('/tmp/dir/assets');
  expect(FUNCTIONS_PATH).toBe('/tmp/dir/functions');
});
