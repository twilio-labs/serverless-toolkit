import {
  AssetResource,
  DeployLocalProjectConfig,
  DeployResult,
  FunctionResource,
} from '@twilio-labs/serverless-api';
import chalk from 'chalk';
import columnify from 'columnify';
import { stripIndent } from 'common-tags';
import { MergeExclusive } from 'type-fest';
import {
  printObjectWithoutHeaders,
  redactPartOfString,
  shouldPrettyPrint,
} from './utils';

function sortByAccess<
  T extends MergeExclusive<AssetResource, FunctionResource>
>(resA: T, resB: T) {
  if (resA.access === resB.access && resA.path && resB.path) {
    return resA.path.localeCompare(resB.path);
  }
  return resA.access.localeCompare(resB.access);
}

function plainPrintDeployedResources(
  config: DeployLocalProjectConfig,
  result: DeployResult
) {
  const functionsOutput: string = columnify(
    result.functionResources.sort(sortByAccess).map(fn => ({
      ...fn,
      url: `https://${result.domain}${fn.path}`,
    })),
    {
      columns: ['access', 'path', 'url'],
      showHeaders: false,
    }
  );

  const assetsOutput: string = columnify(
    result.assetResources.sort(sortByAccess).map(asset => ({
      ...asset,
      url: `https://${result.domain}${asset.path}`,
    })),
    {
      columns: ['access', 'path', 'url'],
      showHeaders: false,
    }
  );

  const data = {
    domain: result.domain,
    serviceName: config.serviceName,
    serviceSid: result.serviceSid,
    environmentSuffix: config.functionsEnv,
    environmentSid: result.environmentSid,
    buildSid: result.buildSid,
  };

  const output = `
deploymentInfo\n${printObjectWithoutHeaders(data)}

functions\n${functionsOutput}

assets\n${assetsOutput}
  `;
  console.log(stripIndent(output));
}

function prettyPrintConfigInfo(config: DeployLocalProjectConfig) {
  let dependencyString = '';
  if (config.pkgJson && config.pkgJson.dependencies) {
    dependencyString = Object.keys(config.pkgJson.dependencies).join(', ');
  }

  console.log(
    chalk`
Deploying functions & assets to Twilio Serverless

{bold.cyan Account}\t\t${config.accountSid}
{bold.cyan Token}\t\t${redactPartOfString(config.authToken)}
{bold.cyan Service Name}\t${config.serviceName}
{bold.cyan Environment}\t${config.functionsEnv}
{bold.cyan Root Directory}\t${config.cwd}
{bold.cyan Dependencies}\t${dependencyString}
{bold.cyan Env Variables}\t${Object.keys(config.env).join(', ')}
`
  );
}

function plainPrintConfigInfo(config: DeployLocalProjectConfig) {
  let dependencyString = '';
  if (config.pkgJson && config.pkgJson.dependencies) {
    dependencyString = Object.keys(config.pkgJson.dependencies).join(',');
  }
  const printObj = {
    account: config.accountSid,
    serviceName: config.serviceName,
    environment: config.functionsEnv,
    rootDirectory: config.cwd,
    dependencies: dependencyString,
    environmentVariables: Object.keys(config.env).join(','),
  };
  console.log(`configInfo\n${printObjectWithoutHeaders(printObj)}\n`);
}

function prettyPrintDeployedResources(
  config: DeployLocalProjectConfig,
  result: DeployResult
) {
  console.log(
    chalk`
{bold.cyan.underline Deployment Details}
{bold.cyan Domain:} ${result.domain}
{bold.cyan Service:}
   ${config.serviceName} {dim (${result.serviceSid})}
{bold.cyan Environment:}
   ${config.functionsEnv} {dim (${result.environmentSid})} 
{bold.cyan Build SID:}
   ${result.buildSid}
  `.trim()
  );
  if (result.functionResources) {
    const functionMessage = result.functionResources
      .sort(sortByAccess)
      .map(fn => {
        const accessPrefix =
          fn.access !== 'public' ? chalk`{bold [${fn.access}]} ` : '';
        return chalk`   ${accessPrefix}{dim https://${result.domain}}${fn.path}`;
      })
      .join('\n');
    console.log(chalk.bold.cyan('Functions:'));
    console.log(functionMessage);
  }

  if (result.assetResources) {
    const assetMessage = result.assetResources
      .sort(sortByAccess)
      .map(fn => {
        const accessPrefix =
          fn.access !== 'public' ? chalk`{bold [${fn.access}]} ` : '';
        return chalk`   ${accessPrefix}{dim https://${result.domain}}${fn.path}`;
      })
      .join('\n');

    console.log(chalk.bold.cyan('Assets:'));
    console.log(assetMessage);
  }
}

export function printConfigInfo(config: DeployLocalProjectConfig) {
  if (shouldPrettyPrint) {
    prettyPrintConfigInfo(config);
  } else {
    plainPrintConfigInfo(config);
  }
}

export function printDeployedResources(
  config: DeployLocalProjectConfig,
  result: DeployResult
) {
  if (shouldPrettyPrint) {
    prettyPrintDeployedResources(config, result);
  } else {
    plainPrintDeployedResources(config, result);
  }
}
