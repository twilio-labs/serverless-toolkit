const { functionToRoute } = require('./runtime/route');
const { runServer } = require('./runtime/server');

module.exports = {
  runDevServer: runServer,
  handlerToExpressRoute: functionToRoute,
};
