import { ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';
import bodyParser from 'body-parser';
import { EventEmitter } from 'events';
import express, {
  Express,
  NextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import userAgentMiddleware from 'express-useragent';
import cookieParser from 'cookie-parser';
import nocache from 'nocache';
import { createLogger } from './internal/request-logger';
import { setRoutes } from './internal/route-cache';
import {
  constructGlobalScope,
  functionPathToRoute,
  functionToRoute,
} from './route';
import { RouteInfo, ServerConfig } from './types';
import debug from './utils/debug';
import { wrapErrorInHtml } from './utils/error-html';

const log = debug('twilio-runtime-handler:dev:server');
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
  log('Deleting require cache');
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

export declare interface LocalDevelopmentServer {
  on(event: 'request-log', listener: (logMessage: string) => void): this;
  on(
    event: 'updated-routes',
    listener: (config: ServerConfig, routes: RouteInfo) => void
  ): this;
  new (port: number | string, config: ServerConfig): LocalDevelopmentServer;
}

export class LocalDevelopmentServer extends EventEmitter {
  private app: Express;
  private routes: RouteInfo;
  private routeMap: Map<string, any> = new Map();
  constructor(
    private port: number | string = DEFAULT_PORT,
    private config: ServerConfig
  ) {
    super();
    if (this.config.enableDebugLogs) {
      debug.enable('twilio-runtime-handler:*');
    }
    log('Creating Local Development Server');
    log(
      '@twilio/runtime-handler version: %s',
      require('../../package.json')?.version
    );

    this.normalizeConfig();
    this.routes = this.config.routes;
    this.setRoutes(this.config.routes);
    this.app = this.createServer();
  }

  private normalizeConfig = () => {
    this.config = {
      ...this.config,
      url: this.config.url || `http://localhost:${this.port}`,
      baseDir: this.config.baseDir || process.cwd(),
    };
  };

  private logFunction = (msg: string) => {
    this.emit('request-log', msg);
  };

  private setRoutes = (routes: RouteInfo) => {
    this.routes = routes;
    this.routeMap = setRoutes(this.routes);
  };

  private createServer = () => {
    log('Creating server with config: %p', this.config);

    const app = express();
    app.use(userAgentMiddleware.express());
    app.use(
      bodyParser.urlencoded({
        extended: false,
        limit: DEFAULT_BODY_SIZE_LAMBDA,
      })
    );
    app.use(bodyParser.json({ limit: DEFAULT_BODY_SIZE_LAMBDA }));
    app.use(cookieParser());
    app.get('/favicon.ico', (req, res) => {
      res.redirect(
        'https://www.twilio.com/marketing/bundles/marketing/img/favicons/favicon.ico'
      );
    });

    if (this.config.logs) {
      app.use(createLogger(this.logFunction));
    }

    if (this.config.live) {
      app.use(nocache());
      app.use(requireCacheCleaner);
    }

    if (this.config.legacyMode) {
      process.env.TWILIO_FUNCTIONS_LEGACY_MODE = this.config.legacyMode
        ? 'true'
        : undefined;
      log('Legacy mode enabled');
      app.use('/assets/*', (req, res, next) => {
        req.path = req.path.replace('/assets/', '/');
        next();
      });
    }

    constructGlobalScope(this.config);

    app.set('port', this.port);
    app.all(
      '/*',
      (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
        let routeInfo = this.routeMap.get(req.path);

        if (!routeInfo && req.path === '/') {
          log('Falling back to /assets/index.html');
          // In production we automatically fall back to the contents of /assets/index.html
          routeInfo = this.routeMap.get('/assets/index.html');
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

            if (this.config.forkProcess) {
              functionPathToRoute(functionPath, this.config)(req, res, next);
            } else {
              log('Load & route to function at "%s"', functionPath);
              const twilioFunction = loadTwilioFunction(functionPath);
              if (typeof twilioFunction !== 'function') {
                return res
                  .status(404)
                  .send(
                    `Could not find a "handler" function in file ${functionPath}`
                  );
              }
              functionToRoute(twilioFunction, this.config, functionPath)(
                req,
                res,
                next
              );
            }
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
  };

  listen = () => {
    return new Promise((resolve, reject) => {
      if (typeof this.app === 'undefined') {
        reject(new Error('Unexpected error. Server did not exist.'));
        return;
      }

      this.app.listen(this.port, () => {
        log('Server is listening.');
        resolve(this.app);
      });
    });
  };

  getApp = () => {
    return this.app;
  };

  update = (routes: RouteInfo) => {
    this.setRoutes(routes);
    this.emit('updated-routes', this.config, this.routes);
  };
}

export type { ServerConfig } from './types';
