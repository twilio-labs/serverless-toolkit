const execa = require('execa');

async function installDependencies(targetDirectory) {
  const options = { cwd: targetDirectory, shell: process.env.SHELL };
  const { stdout } = await execa('npm', ['install'], options);
  return stdout;
}

module.exports = { installDependencies };
