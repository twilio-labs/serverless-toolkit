const { functionToRoute } = require('./src/route');
const { runServer } = require('./src/server');

module.exports = {
  runDevServer: runServer,
  handlerToExpressRoute: functionToRoute
};
