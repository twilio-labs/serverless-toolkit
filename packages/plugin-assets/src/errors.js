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
  createErrorHandler,
};
