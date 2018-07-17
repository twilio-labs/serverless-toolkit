const twilio = require('twilio');
const { basename } = require('path');
const { readdirSync } = require('fs');

const { getPaths } = require('./runtime-paths');

function getAssets() {
  const { ASSETS_PATH } = getPaths();
  const files = readdirSync(ASSETS_PATH);
  const assets = {};
  for (const path of files) {
    const filename = basename(path);
    assets[filename] = { path };
  }
  return assets;
}

function getFunctions() {
  const { FUNCTIONS_PATH } = getPaths();
  const files = readdirSync(FUNCTIONS_PATH);
  const functions = {};
  for (const path of files) {
    const filename = basename(path);
    functions[filename] = { path };
  }
  return functions;
}

function getSync({ serviceName = 'default' }) {
  const client = twilio();
  return client.sync.services(serviceName);
}

module.exports = { getSync, getAssets, getFunctions };
