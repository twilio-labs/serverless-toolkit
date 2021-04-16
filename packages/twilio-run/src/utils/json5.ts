import JSON5 from 'json5';

export function json5Loader(filePath: string, content: string) {
  return JSON5.parse(content);
}
