import { getTemplateFiles } from './data';
import { writeFiles } from './filesystem';
import chalk from 'chalk';

export async function downloadTemplate(
  templateName: string,
  bundleName: string,
  targetDirectory: string
): Promise<void> {
  const files = await getTemplateFiles(templateName);
  try {
    await writeFiles(files, targetDirectory, bundleName);
    console.log(chalk`{green SUCCESS} Created new bundle ${bundleName}`);
  } catch (err) {
    console.error(chalk`{red ERROR} ${err.message}`);
  }
}

export { fetchListOfTemplates } from './data';
