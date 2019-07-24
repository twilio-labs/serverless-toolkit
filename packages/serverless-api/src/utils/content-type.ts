/** @module @twilio-labs/serverless-api/dist/utils */

import fileType from 'file-type';
import mime from 'mime-types';

/**
 * Tries to determine the content type of a string or buffer
 *
 * @export
 * @param {(string | Buffer)} content the content to check
 * @returns {(string | undefined)} a valid content type or undefined
 */
export function getContentType(
  content: string | Buffer,
  name?: string
): string | undefined {
  let contentType: string | undefined;

  if (typeof content !== 'string') {
    const type = fileType(content);
    if (type) {
      contentType = type.mime;
    }
  }

  if (name && !contentType) {
    contentType = mime.lookup(name) || undefined;
  }

  return contentType;
}
