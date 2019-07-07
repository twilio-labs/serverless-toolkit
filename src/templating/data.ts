import debug from 'debug';
import got from 'got';

const log = debug('twilio-run:new:template-data');

const TEMPLATES_URL =
  'https://raw.githubusercontent.com/twilio-labs/function-templates/master/templates.json';
const CONTENT_BASE_URL =
  'https://api.github.com/repos/twilio-labs/function-templates/contents';

export async function fetchListOfTemplates() {
  const response = await got(TEMPLATES_URL, { json: true });
  const { templates } = response.body;
  return templates;
}

export async function getTemplateFiles(templateId, functionName) {
  try {
    const response = await got(CONTENT_BASE_URL + `/${templateId}`, {
      json: true,
    });
    const output = response.body
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
