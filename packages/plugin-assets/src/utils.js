const ora = require('ora');

const createUtils = command => {
  const spinner = ora();
  const originalDebug = require('debug')(`twilio:assets:${command}`);
  const debug = message => {
    const spinnerText = spinner.text;
    spinner.stop();
    originalDebug(message);
    spinner.start(spinnerText);
  };
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
