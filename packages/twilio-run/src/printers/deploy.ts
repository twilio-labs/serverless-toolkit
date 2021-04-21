import {
  AssetResource,
  DeployResult,
  FunctionResource,
} from '@twilio-labs/serverless-api';
import chalk from 'chalk';
import columnify from 'columnify';
import { stripIndent } from 'common-tags';
import terminalLink from 'terminal-link';
import { MergeExclusive } from 'type-fest';
import { DeployLocalProjectConfig } from '../config/deploy';
import { logger } from '../utils/logger';
import { writeOutput } from '../utils/output';
import {
  getTwilioConsoleDeploymentUrl,
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
    runtime: result.runtime,
    viewLiveLogs: getTwilioConsoleDeploymentUrl(
      result.serviceSid,
      result.environmentSid
    ),
  };

  const output = `
deploymentInfo\n${printObjectWithoutHeaders(data)}

functions\n${functionsOutput}

assets\n${assetsOutput}
  `;
  writeOutput(stripIndent(output));
}

function prettyPrintConfigInfo(config: DeployLocalProjectConfig) {
  let dependencyString = '';
  if (config.pkgJson && config.pkgJson.dependencies) {
    dependencyString = Object.keys(config.pkgJson.dependencies).join(', ');
  }

  logger.info('\nDeploying functions & assets to the Twilio Runtime');
  writeOutput(
    chalk`
{bold.cyan Username}\t${config.username}
{bold.cyan Password}\t${redactPartOfString(config.password)}
{bold.cyan Service Name}\t${config.serviceName}
{bold.cyan Environment}\t${config.functionsEnv}
{bold.cyan Root Directory}\t${config.cwd}
{bold.cyan Dependencies}\t${dependencyString}
{bold.cyan Env Variables}\t${Object.keys(config.env).join(', ')}
{bold.cyan Runtime}\t\t${config.runtime}
`
  );
}

function plainPrintConfigInfo(config: DeployLocalProjectConfig) {
  let dependencyString = '';
  if (config.pkgJson && config.pkgJson.dependencies) {
    dependencyString = Object.keys(config.pkgJson.dependencies).join(',');
  }
  const printObj = {
    account: config.username,
    serviceName: config.serviceName,
    environment: config.functionsEnv,
    rootDirectory: config.cwd,
    dependencies: dependencyString,
    environmentVariables: Object.keys(config.env).join(','),
    runtime: config.runtime,
  };
  writeOutput(`configInfo\n${printObjectWithoutHeaders(printObj)}\n`);
}

function prettyPrintDeployedResources(
  config: DeployLocalProjectConfig,
  result: DeployResult
) {
  const twilioConsoleLogsLink = terminalLink(
    'Open the Twilio Console',
    getTwilioConsoleDeploymentUrl(result.serviceSid, result.environmentSid),
    {
      fallback: (text: string, url: string) => chalk.dim(url),
    }
  );

  writeOutput(
    chalk`
{bold.cyan.underline Deployment Details}
{bold.cyan Domain:} ${result.domain}
{bold.cyan Service:}
   ${config.serviceName} {dim (${result.serviceSid})}
{bold.cyan Environment:}
   ${config.functionsEnv} {dim (${result.environmentSid})}
{bold.cyan Build SID:}
   ${result.buildSid}
{bold.cyan Runtime:}
   ${result.runtime}
{bold.cyan View Live Logs:}
   ${twilioConsoleLogsLink}
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
    writeOutput(chalk.bold.cyan('Functions:'));
    writeOutput(functionMessage);
  }

  if (result.assetResources) {
    const assetMessage = result.assetResources
      .sort(sortByAccess)
      .map(asset => {
        const accessPrefix =
          asset.access !== 'public' ? chalk`{bold [${asset.access}]} ` : '';
        const accessUrl =
          asset.access === 'private'
            ? chalk`{dim Runtime.getAssets()['}${asset.path}{dim ']}`
            : chalk`{dim https://${result.domain}}${asset.path}`;
        return `   ${accessPrefix}${accessUrl}`;
      })
      .join('\n');

    writeOutput(chalk.bold.cyan('Assets:'));
    writeOutput(assetMessage);
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
