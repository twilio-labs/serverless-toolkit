const isCi = require('is-ci');
const chalk = require('chalk');
const { stripIndent } = require('common-tags');
const title = require('title');
const logSymbols = require('log-symbols');

function formatDate(dateStr) {
  return new Date(dateStr).toString();
}

function printObject(obj, keys) {
  return keys
    .map(key => {
      const val = obj[key];
      if (Array.isArray(val)) {
        return val
          .map(x => {
            if (x.name) {
              // we have a dependency
              return `${x.name}@${x.version}`;
            } else if (x.function_sid) {
              return x.function_sid;
            } else if (x.asset_sid) {
              return x.asset_sid;
            }
          })
          .join(',');
      }
      return val;
    })
    .filter(Boolean)
    .join('\t');
}

function printSection(type, sectionEntries) {
  let keys = [];
  if (type === 'environments') {
    keys = [
      'account_sid',
      'service_sid',
      'sid',
      'build_sid',
      'unique_name',
      'domain_name',
      'domain_suffix',
      'date_created',
      'date_updated',
    ];
  } else if (type === 'builds') {
    keys = [
      'account_sid',
      'service_sid',
      'sid',
      'status',
      'date_created',
      'date_updated',
      'function_versions',
      'asset_versions',
      'dependencies',
    ];
  } else if (type === 'services') {
    keys = [
      'account_sid',
      'sid',
      'unique_name',
      'friendly_name',
      'date_created',
      'date_updated',
    ];
  } else if (type === 'variables') {
    keys = [
      'account_sid',
      'service_sid',
      'environment_sid',
      'sid',
      'key',
      'value',
      'date_created',
      'date_updated',
    ];
    sectionEntries = sectionEntries.entries;
  }
  return `${keys.join('\t')}\n${sectionEntries
    .map(obj => printObject(obj, keys))
    .join('\n')}`;
}

function printListResultPlain(result) {
  const types = Object.keys(result);

  if (types.length === 1) {
    console.log(printSection(types[0], result[types[0]]));
    return;
  }

  for (const type of types) {
    const section = result[type];
    const output = printSection(type, section);
    console.log(type + '\n' + output + '\n');
  }
}

function prettyPrintVariables(variables) {
  const { entries, environmentSid } = variables;

  const variableString = entries.map((entry, idx) => {
    const symbol = idx + 1 === entries.length ? '└──' : '├──';
    return stripIndent(chalk`
    ⎪ ${symbol} {bold ${entry.key}:} ${entry.value}
    `);
  });

  return stripIndent(chalk`
  ⎪ {bold For Environment:} ${environmentSid}\n${variableString}
  `);
}

function prettyPrintEnvironment(environment) {
  return stripIndent(chalk`
  ⎪ ${environment.unique_name} (${environment.domain_suffix})
  ⎪ ├── {bold SID:} ${environment.sid}
  ⎪ ├── {bold URL:} ${environment.domain_name}
  ⎪ ├── {bold Active Build:} ${environment.build_sid}
  ⎪ └── {bold Last Updated:} ${formatDate(environment.date_updated)}
  `);
}

function prettyPrintServices(service) {
  return stripIndent(chalk`
  ⎪
  ⎪ {cyan.bold ${service.unique_name}}
  ⎪ ├── {bold SID: } ${service.sid}
  ⎪ ├── {bold Created: } ${formatDate(service.date_created)}
  ⎪ └── {bold Updated: } ${formatDate(service.date_updated)}
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
  ⎪ ${build.sid} (${status})
  ⎪ └── ${chalk`{bold Date:}`} ${formatDate(build.date_updated)}
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
  }
  const output = stripIndent`
    ${sectionHeader}\n${content}
  `;
  return output;
}

function printListResultTerminal(result) {
  const sections = Object.keys(result);
  const output = sections
    .map(section => prettyPrintSection(section, result[section]))
    .join('\n\n');

  console.log(output);
}

function printListResult(result) {
  if (process.stdout.isTTY && !isCi) {
    printListResultTerminal(result);
  } else {
    printListResultPlain(result);
  }
}

module.exports = { printListResult };
