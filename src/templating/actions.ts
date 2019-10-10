import chalk from 'chalk';
import { logger } from '../utils/logger';
import { getTemplateFiles } from './data';
import { writeFiles } from './filesystem';

export async function downloadTemplate(
  templateName: string,
  namespace: string,
  targetDirectory: string
): Promise<void> {
  try {
    const files = await getTemplateFiles(templateName);
    await writeFiles(files, targetDirectory, namespace);
    logger.info(
      chalk`{green SUCCESS} Downloaded new template into the "${namespace}" subdirectories`
    );
  } catch (err) {
    logger.error(err.message, err.name);
  }
}

export { fetchListOfTemplates } from './data';
