const { resolve } = require('path');

function getPaths(baseDir) {
  if (baseDir && !process.env.LOCAL_TWILIO_FUNCTIONS_PATH) {
    process.env.LOCAL_TWILIO_FUNCTIONS_PATH = baseDir;
  }

  const ASSETS_PATH = resolve(
    process.env.LOCAL_TWILIO_FUNCTIONS_PATH,
    'assets'
  );
  const FUNCTIONS_PATH = resolve(
    process.env.LOCAL_TWILIO_FUNCTIONS_PATH,
    'functions'
  );

  return { ASSETS_PATH, FUNCTIONS_PATH };
}

module.exports = { getPaths };
