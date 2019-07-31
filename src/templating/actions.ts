import { getTemplateFiles } from './data';
import { writeFiles } from './filesystem';
import chalk from 'chalk';

export async function downloadTemplate(
  templateName: string,
  namespace: string,
  targetDirectory: string
): Promise<void> {
  const files = await getTemplateFiles(templateName);
  try {
    await writeFiles(files, targetDirectory, namespace);
    console.log(
      chalk`{green SUCCESS} Downloaded new template into the "${namespace}" subdirectories`
    );
  } catch (err) {
    console.error(chalk`{red ERROR} ${err.message}`);
  }
}

export { fetchListOfTemplates } from './data';
