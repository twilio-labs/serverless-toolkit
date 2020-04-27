import fs from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import { getContentType } from '../content-type';

const readFile = promisify(fs.readFile);

describe('getContentType', () => {
  test('handles png asset', async () => {
    const pngAsset = await readFile(
      resolve(__dirname, '../../__fixtures__/assets/twilio-logomark-red.png')
    );
    const result = await getContentType(pngAsset, 'twilio-logomark-red.png');
    expect(result).toBe('image/png');
  });

  test('handles svg asset if file is named svg', async () => {
    const svgAsset = await readFile(
      resolve(__dirname, '../../__fixtures__/assets/example.svg')
    );
    const result = await getContentType(svgAsset, 'example.svg');
    expect(result).toBe('image/svg+xml');
  });

  test('falls back for svg to xml if name is missing', async () => {
    const svgAsset = await readFile(
      resolve(__dirname, '../../__fixtures__/assets/example.svg')
    );
    const result = await getContentType(svgAsset);
    expect(result).toBe('application/xml');
  });

  test('falls back for svg to xml if name has no extension', async () => {
    const svgAsset = await readFile(
      resolve(__dirname, '../../__fixtures__/assets/example.svg')
    );
    const result = await getContentType(svgAsset, 'example-without-extension');
    expect(result).toBe('application/xml');
  });

  test('handles JavaScript files as strings', async () => {
    const jsFileContent = `module.exports = true`;
    const result = await getContentType(
      jsFileContent,
      'some-function.protected.js'
    );
    expect(result).toBe('application/javascript');
  });

  test('returns undefined for missing filenames and string content', async () => {
    const jsFileContent = `module.exports = true`;
    const result = await getContentType(jsFileContent);
    expect(result).toBe(undefined);
  });
});
