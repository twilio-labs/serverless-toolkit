import twilio from 'twilio';
import debug from 'debug';
import { RuntimeInstance } from '@twilio-labs/serverless-runtime-types/types';

const log = debug('twilio-run:runtime');

const { getCachedResources } = require('./route-cache');

function getAssets() {
  const { assets } = getCachedResources();
  if (assets.length === 0) {
    return {};
  }

  const result = {};
  for (const asset of assets) {
    if (asset.access === 'private') {
      const prefix =
        process.env.TWILIO_FUNCTIONS_LEGACY_MODE === 'true' ? '/assets' : '';
      result[prefix + asset.assetPath] = { path: asset.path };
    }
  }
  log('Found the following assets available: %O', result);
  return result;
}

function getFunctions() {
  const { functions } = getCachedResources();
  if (functions.length === 0) {
    return {};
  }

  const result = {};
  for (const fn of functions) {
    result[fn.functionPath] = { path: fn.path };
  }
  log('Found the following functions available: %O', result);
  return result;
}

export function create({ env }): RuntimeInstance {
  function getSync(config) {
    config = config || { serviceName: 'default' };
    const client = twilio(env.ACCOUNT_SID, env.AUTH_TOKEN);
    return client.sync.services(config.serviceName);
  }

  return { getSync, getAssets, getFunctions };
}

module.exports = { create };
