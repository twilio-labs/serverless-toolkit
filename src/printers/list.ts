import chalk from 'chalk';
import { stripIndent } from 'common-tags';
import title from 'title';
import logSymbols from 'log-symbols';
import columnify from 'columnify';
import startCase from 'lodash.startcase';

import { shouldPrettyPrint, supportsEmoji } from './utils';
import { ListConfig } from '../commands/list';
import {
  ListResult,
  FunctionVersion,
  AssetVersion,
  VariableResource,
  EnvironmentResource,
  ServiceResource,
  BuildResource,
  ListOptions,
} from '@twilio-labs/serverless-api';

type KeyMaps = {
  [key in ListOptions]: string[];
};

const baseKeys: KeyMaps = {
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

const extendedKeys: KeyMaps = {
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toString();
}

const headingTransform = (name: string) => {
  return chalk.cyan.bold(startCase(name).replace(/Sid$/g, 'SID'));
};

function printRows(rows: any[], keys: string[]) {
  return columnify(rows, { columns: keys, headingTransform });
}

function getKeys(type: ListOptions, config: ListConfig) {
  let keys = config.properties || [];

  if (config.extendedOutput) {
    keys = extendedKeys[type];
  } else if (!config.properties) {
    keys = baseKeys[type];
  }

  return keys;
}

function printSection<T extends ListOptions>(
  type: T,
  sectionEntries: ListResult[T],
  config: ListConfig
) {
  let keys = getKeys(type, config);

  let sectionEntryArray: any[] = [];
  if (Array.isArray(sectionEntries)) {
    sectionEntryArray = sectionEntries;
  } else if (sectionEntries && sectionEntries.entries) {
    sectionEntryArray = sectionEntries.entries;
  }

  return printRows(sectionEntryArray, keys);
}

function printListResultPlain(result: ListResult, config: ListConfig) {
  const types = Object.keys(result) as ListOptions[];

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

export type CommonKeysFunctionAndAssetVersion = Extract<
  keyof FunctionVersion,
  keyof AssetVersion
>;
export type CommonType = {
  [key in CommonKeysFunctionAndAssetVersion]: FunctionVersion[key];
};
export type FunctionOrAssetContent = {
  environmentSid: string;
  entries: CommonType[];
};

function prettyPrintFunctionsOrAssets(result: FunctionOrAssetContent) {
  const { entries, environmentSid } = result;
  const resourceString = entries
    .map<string>((entry: CommonType, idx: number): string => {
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

type VariablesContent = {
  environmentSid: string;
  entries: VariableResource[];
};

function prettyPrintVariables(variables: VariablesContent) {
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

function prettyPrintEnvironment(environment: EnvironmentResource): string {
  return stripIndent(chalk`
  │ ${environment.unique_name} (${environment.domain_suffix})
  │ ├── {bold SID:} ${environment.sid}
  │ ├── {bold URL:} ${environment.domain_name}
  │ ├── {bold Active Build:} ${environment.build_sid}
  │ └── {bold Last Updated:} ${formatDate(environment.date_updated)}
  `);
}

function prettyPrintServices(service: ServiceResource): string {
  return stripIndent(chalk`
  │
  │ {cyan.bold ${service.unique_name}}
  │ ├── {bold SID: } ${service.sid}
  │ ├── {bold Created: } ${formatDate(service.date_created)}
  │ └── {bold Updated: } ${formatDate(service.date_updated)}
  `);
}

function prettyPrintBuilds(build: BuildResource): string {
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

function prettyPrintSection<T extends ListOptions>(
  sectionTitle: ListOptions,
  sectionContent: ListResult[T]
): string {
  const sectionHeader = chalk.cyan.bold(`${title(sectionTitle)}: `);
  let content = '';
  if (sectionTitle === 'builds') {
    content = (sectionContent as BuildResource[])
      .map(prettyPrintBuilds)
      .join('\n');
  } else if (sectionTitle === 'environments') {
    content = (sectionContent as EnvironmentResource[])
      .map(prettyPrintEnvironment)
      .join('\n');
  } else if (sectionTitle === 'services') {
    content = (sectionContent as ServiceResource[])
      .map(prettyPrintServices)
      .join('\n');
  } else if (sectionTitle === 'variables') {
    content = prettyPrintVariables(sectionContent as VariablesContent);
  } else if (sectionTitle === 'functions' || sectionTitle === 'assets') {
    content = prettyPrintFunctionsOrAssets(
      (sectionContent as unknown) as FunctionOrAssetContent
    );
  }
  const output = stripIndent`
    ${sectionHeader}\n${content}
  `;
  return output;
}

function printListResultTerminal(result: ListResult, config: ListConfig): void {
  const sections = Object.keys(result) as ListOptions[];
  const output = sections
    .map(section => prettyPrintSection(section, result[section]))
    .join('\n\n');

  console.log(output);
}

export function printListResult(result: ListResult, config: ListConfig): void {
  if (shouldPrettyPrint && !config.properties && !config.extendedOutput) {
    printListResultTerminal(result, config);
  } else {
    printListResultPlain(result, config);
  }
}
