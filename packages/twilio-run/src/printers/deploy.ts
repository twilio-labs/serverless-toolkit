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
import { OutputFormat } from '../commands/shared';
import { DeployLocalProjectConfig } from '../config/deploy';
import { logger } from '../utils/logger';
import { writeJSONOutput, writeOutput } from '../utils/output';
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
    result.functionResources.sort(sortByAccess).map((fn) => ({
      ...fn,
      url: `https://${result.domain}${fn.path}`,
    })),
    {
      columns: ['access', 'path', 'url'],
      showHeaders: false,
    }
  );

  const assetsOutput: string = columnify(
    result.assetResources.sort(sortByAccess).map((asset) => ({
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
      result.environmentSid,
      config.region
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

  const serviceInfo = config.serviceSid?.startsWith('ZS')
    ? chalk`{bold.cyan Service SID}\t${config.serviceSid}`
    : chalk`{bold.cyan Service Name}\t${config.serviceName}`;

  logger.info('\nDeploying functions & assets to the Twilio Runtime');
  writeOutput(
    chalk`
{bold.cyan Username}\t${config.username}
{bold.cyan Password}\t${redactPartOfString(config.password)}
${serviceInfo}
{bold.cyan Environment}\t${config.functionsEnv}
{bold.cyan Root Directory}\t${config.cwd}
{bold.cyan Dependencies}\t${dependencyString}
{bold.cyan Env Variables}\t${Object.keys(config.env).join(', ')}
{bold.cyan Runtime}\t\t${config.runtime || 'default'}
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
    serviceName: config.serviceName || undefined,
    serviceSid: config.serviceSid,
    environment: config.functionsEnv,
    rootDirectory: config.cwd,
    dependencies: dependencyString,
    environmentVariables: Object.keys(config.env).join(','),
    runtime: config.runtime,
  };

  if (printObj.serviceSid) {
    delete printObj.serviceName;
  }

  writeOutput(`configInfo\n${printObjectWithoutHeaders(printObj)}\n`);
}

function prettyPrintDeployedResources(
  config: DeployLocalProjectConfig,
  result: DeployResult
) {
  const twilioConsoleLogsLink = terminalLink(
    'Open the Twilio Console',
    getTwilioConsoleDeploymentUrl(
      result.serviceSid,
      result.environmentSid,
      config.region
    ),
    {
      fallback: (text: string, url: string) => chalk.dim(url),
    }
  );

  writeOutput(
    chalk`
{bold.cyan.underline Deployment Details}
{bold.cyan Domain:} ${result.domain}
{bold.cyan Service:}
   ${result.serviceName} {dim (${result.serviceSid})}
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
      .map((fn) => {
        const accessPrefix = chalk`{bold [${fn.access}]} `;
        return chalk`   ${accessPrefix}{dim https://${result.domain}}${fn.path}`;
      })
      .join('\n');
    writeOutput(chalk.bold.cyan('Functions:'));
    writeOutput(functionMessage);
  }

  if (result.assetResources) {
    const assetMessage = result.assetResources
      .sort(sortByAccess)
      .map((asset) => {
        const accessPrefix = chalk`{bold [${asset.access}]} `;
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

export function printConfigInfo(
  config: DeployLocalProjectConfig,
  outputFormat: OutputFormat
) {
  if (outputFormat === 'json') {
    return;
  }
  if (shouldPrettyPrint) {
    prettyPrintConfigInfo(config);
  } else {
    plainPrintConfigInfo(config);
  }
}

export function printJsonDeployedResources(
  config: DeployLocalProjectConfig,
  result: DeployResult
) {
  function formatResource(resource: FunctionResource | AssetResource) {
    return {
      access: resource.access,
      path: resource.path,
      url: `https://${result.domain}${resource.path}`,
    };
  }

  const data = {
    domain: result.domain,
    serviceName: result.serviceName,
    serviceSid: result.serviceSid,
    environmentSuffix: config.functionsEnv,
    environmentSid: result.environmentSid,
    buildSid: result.buildSid,
    runtime: result.runtime,
    viewLiveLogs: getTwilioConsoleDeploymentUrl(
      result.serviceSid,
      result.environmentSid,
      config.region
    ),
    functions: result.functionResources.sort(sortByAccess).map(formatResource),
    assets: result.assetResources.sort(sortByAccess).map(formatResource),
  };

  writeJSONOutput(data);
}

export function printDeployedResources(
  config: DeployLocalProjectConfig,
  result: DeployResult,
  outputFormat: OutputFormat
) {
  if (outputFormat === 'json') {
    printJsonDeployedResources(config, result);
    return;
  }
  if (shouldPrettyPrint) {
    prettyPrintDeployedResources(config, result);
  } else {
    plainPrintDeployedResources(config, result);
  }
}
