import got from 'got';
import { getDebugFunction } from '../utils/logger';

const debug = getDebugFunction('twilio-run:new:template-data');

const TEMPLATES_URL =
  'https://raw.githubusercontent.com/twilio-labs/function-templates/master/templates.json';
const CONTENT_BASE_URL =
  'https://api.github.com/repos/twilio-labs/function-templates/contents';

export type Template = {
  id: string;
  name: string;
  description: string;
};

export type TemplatesPayload = {
  templates: Template[];
};

export async function fetchListOfTemplates(): Promise<Template[]> {
  const response = await got(TEMPLATES_URL, { json: true });
  const { templates } = response.body as TemplatesPayload;
  return templates;
}

export type TemplateFileInfo = {
  name: string;
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

async function getFiles(
  templateId: string,
  directory: string
): Promise<TemplateFileInfo[]> {
  const response = await got(CONTENT_BASE_URL + `/${templateId}/${directory}`, {
    json: true,
  });
  const repoContents = response.body as RawContentsPayload;
  return repoContents.map(file => {
    return {
      name: file.name,
      type: directory,
      content: file.download_url,
    };
  });
}

export async function getTemplateFiles(
  templateId: string
): Promise<TemplateFileInfo[]> {
  try {
    const response = await got(CONTENT_BASE_URL + `/${templateId}`, {
      json: true,
    });
    const repoContents = response.body as RawContentsPayload;

    const assets = repoContents.find(file => file.name === 'assets')
      ? getFiles(templateId, 'assets')
      : [];
    const functions = repoContents.find(file => file.name === 'functions')
      ? getFiles(templateId, 'functions')
      : [];

    const otherFiles = repoContents
      .filter(file => {
        return file.name === 'package.json' || file.name === '.env';
      })
      .map(file => {
        return {
          name: file.name,
          type: file.name,
          content: file.download_url,
        };
      });
    const files = otherFiles.concat(
      ...(await Promise.all([assets, functions]))
    );
    return files;
  } catch (err) {
    debug(err.message);
    throw new Error('Invalid template');
  }
}
