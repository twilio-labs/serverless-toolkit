import { SearchConfig } from '@twilio-labs/serverless-api/dist/utils';
import { ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';
import type {
  LocalDevelopmentServer as LDS,
  ServerConfig,
} from '@twilio/runtime-handler/dist/dev-runtime/server';
import bodyParser from 'body-parser';
import chokidar from 'chokidar';
import express, {
  Express,
  NextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import userAgentMiddleware from 'express-useragent';
import debounce from 'lodash.debounce';
import nocache from 'nocache';
import path from 'path';
import { StartCliConfig } from '../config/start';
import { printRouteInfo } from '../printers/start';
import { wrapErrorInHtml } from '../utils/error-html';
import { getDebugFunction, logger, LoggingLevel } from '../utils/logger';
import { writeOutput } from '../utils/output';
import { requireFromProject } from '../utils/requireFromProject';
import { createLogger } from './internal/request-logger';
import { getRouteMap } from './internal/route-cache';
import { getFunctionsAndAssets, RouteInfo } from './internal/runtime-paths';
import {
  constructGlobalScope,
  functionPathToRoute,
  functionToRoute,
} from './route';

const debug = getDebugFunction('twilio-run:server');
const DEFAULT_PORT = process.env.PORT || 3000;
const RELOAD_DEBOUNCE_MS = 250;
const DEFAULT_BODY_SIZE_LAMBDA = '6mb';

function loadTwilioFunction(fnPath: string): ServerlessFunctionSignature {
  return require(fnPath).handler;
}

function requireCacheCleaner(
  req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction
) {
  debug('Deleting require cache');
  Object.keys(require.cache).forEach((key) => {
    // Entries in the cache that end with .node are compiled binaries, deleting
    // those has unspecified results, so we keep them.
    // Entries in the cache that include "twilio-run" are part of this module
    // or its dependencies, so don't need to be cleared.
    if (!(key.endsWith('.node') || key.includes('twilio-run'))) {
      delete require.cache[key];
    }
  });
  next();
}

async function findRoutes(config: StartCliConfig): Promise<RouteInfo> {
  const searchConfig: SearchConfig = {};

  if (config.functionsFolderName) {
    searchConfig.functionsFolderNames = [config.functionsFolderName];
  }

  if (config.assetsFolderName) {
    searchConfig.assetsFolderNames = [config.assetsFolderName];
  }

  return getFunctionsAndAssets(config.baseDir, searchConfig);
}

function configureWatcher(config: StartCliConfig, server: LDS) {
  const watcher = chokidar.watch(
    [
      path.join(
        config.baseDir,
        config.functionsFolderName
          ? `/(${config.functionsFolderName})/**/*)`
          : '/(functions|src)/**/*.js'
      ),
      path.join(
        config.baseDir,
        config.assetsFolderName
          ? `/(${config.assetsFolderName})/**/*)`
          : '/(assets|static)/**/*'
      ),
    ],
    {
      ignoreInitial: true,
    }
  );

  const reloadRoutes = async () => {
    const routes = await findRoutes(config);
    server.update(routes);
  };

  // Debounce so we don't needlessly reload when multiple files are changed
  const debouncedReloadRoutes = debounce(reloadRoutes, RELOAD_DEBOUNCE_MS);

  watcher
    .on('add', (path) => {
      debug(`Reloading Routes: add @ ${path}`);
      debouncedReloadRoutes();
    })
    .on('unlink', (path) => {
      debug(`Reloading Routes: unlink @ ${path}`);
      debouncedReloadRoutes();
    });

  // Clean the watcher up when exiting.
  process.on('exit', () => watcher.close());
}

export async function createLocalDevelopmentServer(
  port: string | number = DEFAULT_PORT,
  config: StartCliConfig
): Promise<Express> {
  try {
    const { LocalDevelopmentServer } = requireFromProject(
      config.baseDir,
      '@twilio/runtime-handler/dev'
    ) as { LocalDevelopmentServer: LDS };

    const routes = await findRoutes(config);

    const server = new LocalDevelopmentServer(port, {
      inspect: config.inspect,
      baseDir: config.baseDir,
      env: config.env,
      port: config.port,
      url: config.url,
      detailedLogs: config.detailedLogs,
      live: config.live,
      logs: config.logs,
      legacyMode: config.legacyMode,
      appName: config.appName,
      forkProcess: config.forkProcess,
      logger: logger,
      routes: routes,
      enableDebugLogs: logger.config.level === LoggingLevel.debug,
    });
    server.on('request-log', (logMessage: string) => {
      writeOutput(logMessage);
    });
    server.on('updated-routes', async (config: ServerConfig) => {
      await printRouteInfo(config);
    });
    configureWatcher(config, server);
    return server.getApp();
  } catch (err) {
    debug(
      'Failed to load server from @twilio/runtime-handler/dev. Falling back to built-in.'
    );
    return createServer(port, config);
  }
}

/** @deprecated */
export async function createServer(
  port: string | number = DEFAULT_PORT,
  config: StartCliConfig
): Promise<Express> {
  config = {
    ...config,
    url: config.url || `http://localhost:${port}`,
    baseDir: config.baseDir || process.cwd(),
  };

  debug('Starting server with config: %p', config);

  const app = express();
  app.use(userAgentMiddleware.express());
  app.use(
    bodyParser.urlencoded({ extended: false, limit: DEFAULT_BODY_SIZE_LAMBDA })
  );
  app.use(bodyParser.json({ limit: DEFAULT_BODY_SIZE_LAMBDA }));
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
    app.use(requireCacheCleaner);
  }

  if (config.legacyMode) {
    process.env.TWILIO_FUNCTIONS_LEGACY_MODE = config.legacyMode
      ? 'true'
      : undefined;
    debug('Legacy mode enabled');
    app.use('/assets/*', (req, res, next) => {
      req.path = req.path.replace('/assets/', '/');
      next();
    });
  }

  let routeMap = await getRouteMap(config);

  if (config.live) {
    const watcher = chokidar.watch(
      [
        path.join(config.baseDir, '/(functions|src)/**/*.js'),
        path.join(config.baseDir, '/(assets|static)/**/*'),
      ],
      {
        ignoreInitial: true,
      }
    );

    const reloadRoutes = async () => {
      routeMap = await getRouteMap(config);

      await printRouteInfo(config);
    };

    // Debounce so we don't needlessly reload when multiple files are changed
    const debouncedReloadRoutes = debounce(reloadRoutes, RELOAD_DEBOUNCE_MS);

    watcher
      .on('add', (path) => {
        debug(`Reloading Routes: add @ ${path}`);
        debouncedReloadRoutes();
      })
      .on('unlink', (path) => {
        debug(`Reloading Routes: unlink @ ${path}`);
        debouncedReloadRoutes();
      });

    // Clean the watcher up when exiting.
    process.on('exit', () => watcher.close());
  }

  constructGlobalScope(config);

  app.set('port', port);
  app.all(
    '/*',
    (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
      let routeInfo = routeMap.get(req.path);

      if (!routeInfo && req.path === '/') {
        // In production we automatically fall back to the contents of /assets/index.html
        debug('Falling back to /assets/index.html');
        routeInfo = routeMap.get('/assets/index.html');
      }

      if (req.method === 'OPTIONS' && routeInfo) {
        res.set({
          'access-control-allow-origin': '*',
          'access-control-allow-headers':
            'Accept, Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, User-Agent',
          'access-control-allow-methods': 'GET, POST, OPTIONS',
          'access-control-expose-headers': 'ETag',
          'access-control-max-age': '86400',
          'access-control-allow-credentials': true,
          'content-type': 'text/plain; charset=UTF-8',
          'content-length': '0',
        });
        res.status(204).end();

        return;
      }

      if (routeInfo && routeInfo.type === 'function') {
        const functionPath = routeInfo.filePath;
        try {
          if (!functionPath) {
            throw new Error('Missing function path');
          }

          if (config.forkProcess) {
            functionPathToRoute(functionPath, config)(req, res, next);
          } else {
            debug('Load & route to function at "%s"', functionPath);
            const twilioFunction = loadTwilioFunction(functionPath);
            if (typeof twilioFunction !== 'function') {
              return res
                .status(404)
                .send(
                  `Could not find a "handler" function in file ${functionPath}`
                );
            }
            functionToRoute(twilioFunction, config, functionPath)(
              req,
              res,
              next
            );
          }
        } catch (err) {
          debug('Failed to retrieve function. %O', err);
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
  return new Promise((resolve) => {
    app.listen(port);
    resolve(app);
  });
}
