exports.handler = function (context, event, callback) {
  callback(new Error(`I'm throwing`));
};
