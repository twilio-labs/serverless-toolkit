const { join } = require('path');
const { readFile, writeFile, mkdir } = require('fs/promises');

const CONFIG_FILE_NAME = 'plugin-assets-config.json';

class ConfigStore {
  constructor(configDir) {
    this.configDir = configDir;
    this.configPath = join(this.configDir, CONFIG_FILE_NAME);
  }

  async load() {
    try {
      const contents = await readFile(this.configPath, {
        encoding: 'utf-8',
      });
      return JSON.parse(contents);
    } catch (error) {
      return {};
    }
  }

  async save(config) {
    await mkdir(this.configDir, { recursive: true });
    writeFile(this.configPath, JSON.stringify(config), { encoding: 'utf-8' });
  }
}

module.exports = { ConfigStore };
