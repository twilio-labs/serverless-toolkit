const { projectInstall } = require('pkg-install');

async function installDependencies(targetDirectory) {
  const options = { cwd: targetDirectory };
  const { stdout } = await projectInstall(options);
  return stdout;
}

module.exports = { installDependencies };
