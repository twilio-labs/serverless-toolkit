import { stripIndent } from 'common-tags';
import got, { Headers, RequestError } from 'got';
import flatten from 'lodash.flatten';
import path from 'path';
import { getDebugFunction } from '../utils/logger';
const debug = getDebugFunction('twilio-run:new:template-data');

const TEMPLATE_BASE_REPO =
  process.env.TWILIO_SERVERLESS_TEMPLATE_REPO ||
  'twilio-labs/function-templates';
const TEMPLATE_BASE_BRANCH =
  process.env.TWILIO_SERVERLESS_TEMPLATE_BRANCH || 'main';

export const TEMPLATES_URL = `https://raw.githubusercontent.com/${TEMPLATE_BASE_REPO}/${TEMPLATE_BASE_BRANCH}/templates.json`;
export const CONTENT_BASE_URL = `https://api.github.com/repos/${TEMPLATE_BASE_REPO}/contents`;

export type Template = {
  id: string;
  name: string;
  description: string;
};

export type TemplatesPayload = {
  templates: Template[];
};

export async function fetchListOfTemplates(): Promise<Template[]> {
  const response = await got(TEMPLATES_URL, { responseType: 'json' });
  const { templates } = response.body as TemplatesPayload;
  return templates;
}

export type TemplateFileInfo = {
  name: string;
  directory: string;
  type: string;
  content: string;
};

type RawContentsPayload = {
  name: string;
  path: string;
  sha: string;
  size: string;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}[];

type GitHubError = {
  message: string;
  documentation_url?: string;
};

function getFromUrl(url: string) {
  const headers = buildHeader();
  return got(url, {
    responseType: 'json',
    headers,
  });
}

async function getNestedRepoContents(
  url: string,
  dirName: string,
  directory: string
): Promise<TemplateFileInfo[]> {
  const response = await getFromUrl(url);
  const repoContents = response.body as RawContentsPayload;
  return flatten(
    await Promise.all(
      repoContents.map(async (file) => {
        if (file.type === 'dir') {
          return await getNestedRepoContents(
            file.url,
            path.join(dirName, file.name),
            directory
          );
        } else {
          return {
            name: file.name,
            directory: dirName,
            type: directory,
            content: file.download_url,
          };
        }
      })
    )
  );
}

export async function getFiles(
  templateId: string,
  directory: string
): Promise<TemplateFileInfo[]> {
  const response = await getFromUrl(
    CONTENT_BASE_URL + `/${templateId}/${directory}?ref=${TEMPLATE_BASE_BRANCH}`
  );
  const repoContents = response.body as RawContentsPayload;
  return flatten(
    await Promise.all(
      repoContents.map(async (file) => {
        if (file.type === 'dir') {
          return await getNestedRepoContents(file.url, file.name, directory);
        } else {
          return {
            name: file.name,
            type: directory,
            content: file.download_url,
            directory: '',
          };
        }
      })
    )
  );
}

export async function getTemplateFiles(
  templateId: string
): Promise<TemplateFileInfo[]> {
  try {
    const headers = buildHeader();
    const response = await got(
      CONTENT_BASE_URL + `/${templateId}?ref=${TEMPLATE_BASE_BRANCH}`,
      {
        responseType: 'json',
        headers,
      }
    );
    const repoContents = response.body as RawContentsPayload;

    const assets = repoContents.find((file) => file.name === 'assets')
      ? getFiles(templateId, 'assets')
      : [];
    const functions = repoContents.find((file) => file.name === 'functions')
      ? getFiles(templateId, 'functions')
      : [];

    const otherFiles = repoContents
      .filter((file) => {
        return (
          file.name === 'package.json' ||
          file.name === '.env' ||
          file.name === '.env.example' ||
          file.name === 'README.md'
        );
      })
      .map((file) => {
        return {
          name: file.name,
          type: file.name,
          content: file.download_url,
          directory: '',
        };
      });
    const files = otherFiles.concat(
      ...(await Promise.all([assets, functions]))
    );
    return files;
  } catch (err) {
    if (err instanceof Error || err instanceof RequestError) {
      debug(err.message);
    }

    if (err instanceof RequestError) {
      if (err.response) {
        if (err.response.statusCode === 403) {
          throw new Error(
            stripIndent`
            We are sorry but we failed fetching the requested template from GitHub because your IP address has been rate limited. Please try the following to resolve the issue:
  
            - Change your WiFi or make sure you are not connected to a VPN that might cause the rate limiting
  
  
            If the issue persists you can try one of the two options:
  
            - Get a GitHub developer token following https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line (no permissions needed) and add it as TWILIO_SERVERLESS_GITHUB_TOKEN to your environment variables
  
            - Wait for a few minutes up to an hour and try again.
            `
          );
        } else {
          const bodyMessage = err.response.body as GitHubError;
          throw new Error(
            bodyMessage ? `${err.message}\n${bodyMessage.message}` : err.message
          );
        }
      }
    }

    throw new Error('Invalid template');
  }
}

function buildHeader(): Headers {
  let githubToken = '';
  if (process.env.TWILIO_SERVERLESS_GITHUB_TOKEN) {
    githubToken = process.env.TWILIO_SERVERLESS_GITHUB_TOKEN;
  }

  return githubToken ? { Authorization: `token ${githubToken}` } : {};
}
