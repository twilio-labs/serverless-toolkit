const ora = require('ora');

const createUtils = command => {
  const debug = require('debug')(`twilio:assets:${command}`);
  const spinner = ora();
  const handleError = createErrorHandler(debug, spinner);
  return { debug, spinner, handleError };
};

const createErrorHandler = (debug, spinner) => {
  return (error, message) => {
    if (message) {
      spinner.fail(message);
    } else {
      spinner.stop();
    }
    debug('0%', error);
  };
};

module.exports = {
  createUtils,
};
