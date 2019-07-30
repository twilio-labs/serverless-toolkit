import { ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';
import bodyParser from 'body-parser';
import debug from 'debug';
import express, {
  Express,
  NextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import nocache from 'nocache';
import { StartCliConfig } from '../config/start';
import { wrapErrorInHtml } from '../utils/error-html';
import { createLogger } from './internal/request-logger';
import { setRoutes } from './internal/route-cache';
import { getFunctionsAndAssets } from './internal/runtime-paths';
import { functionToRoute } from './route';

const log = debug('twilio-run:server');
const DEFAULT_PORT = process.env.PORT || 3000;

function requireUncached(module: string): any {
  delete require.cache[require.resolve(module)];
  return require(module);
}

function loadTwilioFunction(
  fnPath: string,
  config: StartCliConfig
): ServerlessFunctionSignature {
  if (config.live) {
    log('Uncached loading of %s', fnPath);
    return requireUncached(fnPath).handler;
  } else {
    return require(fnPath).handler;
  }
}

export async function createServer(
  port: string | number = DEFAULT_PORT,
  config: StartCliConfig
): Promise<Express> {
  config = {
    url: `http://localhost:${port}`,
    baseDir: process.cwd(),
    ...config,
  };

  log('Starting server with config: %p', config);

  const app = express();
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.get('/favicon.ico', (req, res) => {
    res.redirect(
      'https://www.twilio.com/marketing/bundles/marketing/img/favicons/favicon.ico'
    );
  });

  if (config.logs) {
    app.use(createLogger(config));
  }

  if (config.live) {
    app.use(nocache());
  }

  if (config.legacyMode) {
    process.env.TWILIO_FUNCTIONS_LEGACY_MODE = config.legacyMode
      ? 'true'
      : undefined;
    log('Legacy mode enabled');
    app.use('/assets/*', (req, res, next) => {
      req.path = req.path.replace('/assets/', '/');
      next();
    });
  }

  const routes = await getFunctionsAndAssets(config.baseDir);
  const routeMap = setRoutes(routes);

  app.set('port', port);
  app.all(
    '/*',
    (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
      if (!routeMap.has(req.path)) {
        res.status(404).send('Could not find request resource');
        return;
      }

      const routeInfo = routeMap.get(req.path);

      if (routeInfo && routeInfo.type === 'function') {
        const functionPath = routeInfo.filePath;
        try {
          if (!functionPath) {
            throw new Error('Missing function path');
          }

          log('Load & route to function at "%s"', functionPath);
          const twilioFunction = loadTwilioFunction(functionPath, config);
          if (typeof twilioFunction !== 'function') {
            return res
              .status(404)
              .send(
                `Could not find a "handler" function in file ${functionPath}`
              );
          }
          functionToRoute(twilioFunction, config, functionPath)(req, res, next);
        } catch (err) {
          log('Failed to retrieve function. %O', err);
          if (err.code === 'ENOENT') {
            res.status(404).send(`Could not find function ${functionPath}`);
          } else {
            res.status(500).send(wrapErrorInHtml(err, functionPath));
          }
        }
      } else if (routeInfo && routeInfo.type === 'asset') {
        if (routeInfo.filePath) {
          if (routeInfo.access === 'private') {
            res.status(403).send('This asset has been marked as private');
          } else {
            res.sendFile(routeInfo.filePath);
          }
        } else {
          res.status(404).send('Could not find asset');
        }
      } else {
        res.status(404).send('Could not find requested resource');
      }
    }
  );
  return app;
}

export async function runServer(
  port: number | string = DEFAULT_PORT,
  config: StartCliConfig
): Promise<Express> {
  const app = await createServer(port, config);
  return new Promise(resolve => {
    app.listen(port);
    resolve(app);
  });
}
