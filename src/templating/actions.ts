import chalk from 'chalk';
import { logger } from '../utils/logger';
import { getTemplateFiles } from './data';
import { writeFiles } from './filesystem';

export async function downloadTemplate(
  templateName: string,
  bundleName: string,
  targetDirectory: string
): Promise<void> {
  const files = await getTemplateFiles(templateName);
  try {
    await writeFiles(files, targetDirectory, bundleName);
    logger.info(chalk`{green SUCCESS} Created new bundle ${bundleName}`);
  } catch (err) {
    logger.error(err.message, err.name);
  }
}

export { fetchListOfTemplates } from './data';
