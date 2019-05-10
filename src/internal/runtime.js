const twilio = require('twilio');
const { basename, join } = require('path');
const { readdirSync } = require('fs');
const debug = require('debug')('twilio-run:runtime');

const { getPaths } = require('./runtime-paths');

function safeReadDirectory(path) {
  try {
    debug('Reading directory %s', path);
    const files = readdirSync(path);
    return files;
  } catch (err) {
    debug('Failed to read directory. %O', err);
    return null;
  }
}

function getAssets() {
  const { ASSETS_PATH } = getPaths();

  const files = safeReadDirectory(ASSETS_PATH);
  if (files === null) {
    return files;
  }

  const assets = {};
  for (const path of files) {
    const filename = basename(path);
    assets[filename] = { path: join(ASSETS_PATH, filename) };
  }
  debug('Found the following assets available: %O', assets);
  return assets;
}

function getFunctions() {
  const { FUNCTIONS_PATH } = getPaths();

  const files = safeReadDirectory(FUNCTIONS_PATH);
  if (files === null) {
    return files;
  }

  const functions = {};
  for (const path of files) {
    const filename = basename(path);
    functions[filename] = { path: join(FUNCTIONS_PATH, filename) };
  }
  debug('Found the following functions available: %O', functions);
  return functions;
}

function create({ env }) {
  function getSync(serviceName = 'default') {
    const client = twilio(env.ACCOUNT_SID, env.AUTH_TOKEN);
    return client.sync.services(serviceName);
  }

  return { getSync, getAssets, getFunctions };
}

module.exports = { create };
