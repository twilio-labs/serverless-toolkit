import debug from 'debug';
import got from 'got';

const log = debug('twilio-run:new:template-data');

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
  type: string;
  functionName: string;
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

export async function getTemplateFiles(
  templateId: string,
  functionName: string
): Promise<TemplateFileInfo[]> {
  try {
    const response = await got(CONTENT_BASE_URL + `/${templateId}`, {
      json: true,
    });
    const output = (response.body as RawContentsPayload)
      .filter(file => {
        return (
          file.name === 'package.json' ||
          file.name === '.env' ||
          (file.name.endsWith('.js') && !file.name.endsWith('.test.js'))
        );
      })
      .map(file => {
        return {
          type: file.name.endsWith('.js') ? 'function' : file.name,
          functionName,
          content: file.download_url,
        };
      });
    return output;
  } catch (err) {
    log(err.message);
    console.error(err);
    throw new Error('Invalid template');
  }
}
