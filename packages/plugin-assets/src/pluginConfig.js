const {
  getCommandPlugin,
} = require('@twilio/cli-core/src/services/require-install');
const { PluginConfig } = require('@twilio/cli-core').services.config;

function getPluginConfig(command) {
  const plugin = getCommandPlugin(command);
  return new PluginConfig(command.config.configDir, plugin.name);
}

module.exports = { getPluginConfig };
