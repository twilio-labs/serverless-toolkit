const chalk = require('chalk');
const { stripIndent } = require('common-tags');
const title = require('title');
const logSymbols = require('log-symbols');
const columnify = require('columnify');
const startCase = require('lodash.startcase');

const { shouldPrettyPrint, supportsEmoji } = require('./utils');

const baseKeys = {
  environments: [
    'sid',
    'build_sid',
    'unique_name',
    'domain_name',
    'domain_suffix',
    'date_updated',
  ],
  builds: ['sid', 'status', 'date_updated'],
  services: ['sid', 'unique_name', 'date_created', 'date_updated'],
  variables: ['environment_sid', 'key', 'value'],
  functions: ['path', 'visibility'],
  assets: ['path', 'visibility'],
};

const extendedKeys = {
  environments: [
    'account_sid',
    'service_sid',
    'sid',
    'build_sid',
    'unique_name',
    'domain_name',
    'domain_suffix',
    'date_created',
    'date_updated',
  ],
  builds: [
    'account_sid',
    'service_sid',
    'sid',
    'status',
    'date_created',
    'date_updated',
    'function_versions',
    'asset_versions',
    'dependencies',
  ],
  services: [
    'account_sid',
    'sid',
    'unique_name',
    'friendly_name',
    'date_created',
    'date_updated',
  ],
  variables: [
    'account_sid',
    'service_sid',
    'environment_sid',
    'sid',
    'key',
    'value',
    'date_created',
    'date_updated',
  ],
  functions: [
    'account_sid',
    'service_sid',
    'function_sid',
    'sid',
    'path',
    'visibility',
    'date_created',
  ],
  assets: [
    'account_sid',
    'service_sid',
    'asset_sid',
    'sid',
    'path',
    'visibility',
    'date_created',
  ],
};

function formatDate(dateStr) {
  return new Date(dateStr).toString();
}

const headingTransform = name => {
  return chalk.cyan.bold(startCase(name).replace(/Sid$/g, 'SID'));
};

function printRows(rows, keys) {
  return columnify(rows, { columns: keys, headingTransform });
}

function getKeys(type, config) {
  let keys = config.properties || [];

  if (config.extendedOutput) {
    keys = extendedKeys[type];
  } else if (!config.properties) {
    keys = baseKeys[type];
  }

  return keys;
}

function printSection(type, sectionEntries, config) {
  let keys = getKeys(type, config);

  if (type === 'functions' || type === 'assets' || type === 'variables') {
    sectionEntries = sectionEntries.entries;
  }

  return printRows(sectionEntries, keys);
}

function printListResultPlain(result, config) {
  const types = Object.keys(result);

  if (types.length === 1) {
    console.log(printSection(types[0], result[types[0]], config));
    return;
  }

  for (const type of types) {
    const section = result[type];
    const output = printSection(type, section, config);
    console.log(startCase(type) + '\n' + output + '\n');
  }
}

function prettyPrintFunctionsOrAssets({ entries, environmentSid }) {
  const resourceString = entries
    .map((entry, idx) => {
      const symbol = idx + 1 === entries.length ? '└──' : '├──';
      let emoji = '';
      if (supportsEmoji) {
        emoji =
          entry.visibility === 'public'
            ? '🌐'
            : entry.visibility === 'protected'
            ? '🔒'
            : '🙈';
      }
      return stripIndent(chalk`
    │ ${symbol} ${emoji}   ${entry.path} {dim [Visibility: ${entry.visibility}]}
    `);
    })
    .join('\n');

  return stripIndent(chalk`
  │ {bold For Environment:} ${environmentSid}\n${resourceString}
  `);
}

function prettyPrintVariables(variables) {
  const { entries, environmentSid } = variables;

  const variableString = entries
    .map((entry, idx) => {
      const symbol = idx + 1 === entries.length ? '└──' : '├──';
      return stripIndent(chalk`
    │ ${symbol} {bold ${entry.key}:} ${entry.value}
    `);
    })
    .join('\n');

  return stripIndent(chalk`
  │ {bold For Environment:} ${environmentSid}\n${variableString}
  `);
}

function prettyPrintEnvironment(environment) {
  return stripIndent(chalk`
  │ ${environment.unique_name} (${environment.domain_suffix})
  │ ├── {bold SID:} ${environment.sid}
  │ ├── {bold URL:} ${environment.domain_name}
  │ ├── {bold Active Build:} ${environment.build_sid}
  │ └── {bold Last Updated:} ${formatDate(environment.date_updated)}
  `);
}

function prettyPrintServices(service) {
  return stripIndent(chalk`
  │
  │ {cyan.bold ${service.unique_name}}
  │ ├── {bold SID: } ${service.sid}
  │ ├── {bold Created: } ${formatDate(service.date_created)}
  │ └── {bold Updated: } ${formatDate(service.date_updated)}
  `);
}

function prettyPrintBuilds(build) {
  let status = chalk.yellow(build.status);
  if (build.status === 'completed') {
    status = chalk.green(`${logSymbols.success} ${build.status}`);
  } else if (build.status === 'failed') {
    status = chalk.red(`${logSymbols.error} ${build.status}`);
  }
  return stripIndent`
  │ ${build.sid} (${status})
  │ └── ${chalk`{bold Date:}`} ${formatDate(build.date_updated)}
  `;
}

function prettyPrintSection(sectionTitle, sectionContent) {
  const sectionHeader = chalk.cyan.bold(`${title(sectionTitle)}: `);
  let content = '';
  if (sectionTitle === 'builds') {
    content = sectionContent.map(prettyPrintBuilds).join('\n');
  } else if (sectionTitle === 'environments') {
    content = sectionContent.map(prettyPrintEnvironment).join('\n');
  } else if (sectionTitle === 'services') {
    content = sectionContent.map(prettyPrintServices).join('\n');
  } else if (sectionTitle === 'variables') {
    content = prettyPrintVariables(sectionContent);
  } else if (sectionTitle === 'functions' || sectionTitle === 'assets') {
    content = prettyPrintFunctionsOrAssets(sectionContent);
  }
  const output = stripIndent`
    ${sectionHeader}\n${content}
  `;
  return output;
}

function printListResultTerminal(result, config) {
  const sections = Object.keys(result);
  const output = sections
    .map(section => prettyPrintSection(section, result[section]))
    .join('\n\n');

  console.log(output);
}

function printListResult(result, config) {
  if (shouldPrettyPrint && !config.properties && !config.extendedOutput) {
    printListResultTerminal(result, config);
  } else {
    printListResultPlain(result, config);
  }
}

module.exports = { printListResult };
