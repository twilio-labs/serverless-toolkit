const chalk = require('chalk');
const { stripIndent } = require('common-tags');
const columnify = require('columnify');
const { shouldPrettyPrint } = require('./utils');

function sortByAccess(resA, resB) {
  if (resA.access === resB.access) {
    if (resA.functionPath) {
      return resA.functionPath.localeCompare(resB.functionPath);
    } else if (resA.assetPath) {
      return resA.assetPath.localeCompare(resB.assetPath);
    }
  }
  return resA.access.localeCompare(resB.access);
}

function plainPrintDeployedResources(config, result) {
  const functionsOutput = columnify(
    result.functionResources.sort(sortByAccess).map(fn => ({
      ...fn,
      url: `https://${result.domain}${fn.functionPath}`,
    })),
    {
      columns: ['access', 'functionPath', 'url'],
      showHeaders: false,
    }
  );

  const assetsOutput = columnify(
    result.assetResources.sort(sortByAccess).map(asset => ({
      ...asset,
      url: `https://${result.domain}${asset.assetPath}`,
    })),
    {
      columns: ['access', 'assetPath', 'url'],
      showHeaders: false,
    }
  );

  const data = {
    domain: result.domain,
    project_name: config.projectName,
    service_sid: result.serviceSid,
    environment_suffix: config.functionsEnv,
    environment_sid: config.ennvironmentSid,
    build_sid: result.buildSid,
  };

  const output = `
${columnify(data, { showHeaders: false })}

functions\n${functionsOutput}

assets\n${assetsOutput}
  `;
  console.log(stripIndent(output));
}

function prettyPrintDeployedResources(config, result) {
  console.log(
    chalk`
{bold Deployment Details}
⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺
{bold Domain:} ${result.domain}
{bold Service:}
   ${config.projectName} {dim (${result.serviceSid})}
{bold Environment:}
   ${config.functionsEnv} {dim (${result.environmentSid})} 
{bold Build SID:}
   ${result.buildSid}
  `.trim()
  );
  if (result.functionResources) {
    const functionMessage = result.functionResources
      .sort(sortByAccess)
      .map(fn => {
        const accessPrefix =
          fn.access !== 'public' ? chalk`{bold [${fn.access}]} ` : '';
        return chalk`   ${accessPrefix}{dim https://${result.domain}}${
          fn.functionPath
        }`;
      })
      .join('\n');
    console.log(chalk.bold('Functions:'));
    console.log(functionMessage);
  }

  if (result.assetResources) {
    const assetMessage = result.assetResources
      .sort(sortByAccess)
      .map(fn => {
        const accessPrefix =
          fn.access !== 'public' ? chalk`{bold [${fn.access}]} ` : '';
        return chalk`   ${accessPrefix}{dim https://${result.domain}}${
          fn.assetPath
        }`;
      })
      .join('\n');

    console.log(chalk.bold('Assets:'));
    console.log(assetMessage);
  }
}

function printDeployedResources(config, result) {
  if (shouldPrettyPrint) {
    prettyPrintDeployedResources(config, result);
  } else {
    plainPrintDeployedResources(config, result);
  }
}

module.exports = { printDeployedResources };
