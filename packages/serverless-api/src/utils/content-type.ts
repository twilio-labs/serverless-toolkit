/** @module @twilio-labs/serverless-api/dist/utils */

import { fromBuffer } from 'file-type';
import mime from 'mime-types';
import path from 'path';

function hasExtension(name: string | undefined): boolean {
  if (typeof name === 'undefined') {
    return false;
  }

  return path.extname(name).length !== 0;
}

/**
 * Tries to determine the content type of a string or buffer
 *
 * @export
 * @param {(string | Buffer)} content the content to check
 * @returns {Promise<(string | undefined)>} a valid content type or undefined
 */
export async function getContentType(
  content: string | Buffer,
  name?: string
): Promise<string | undefined> {
  let contentType: string | undefined;

  if (content instanceof Buffer && !hasExtension(name)) {
    const type = await fromBuffer(content);
    if (type) {
      contentType = type.mime;
    }
  }

  if (name && !contentType) {
    contentType = mime.lookup(name) || undefined;
  }

  return contentType;
}
