/** @module @twilio-labs/serverless-api/dist/utils */

import fileType from 'file-type';
import got from 'got';
import mime from 'mime-types';

/**
 * Uploads a string or buffer to AWS S3 given a unique upload URL and KMS key
 *
 * @export
 * @param {string} url the unique upload URL
 * @param {string} key the KMS key
 * @param {(string | Buffer)} content the content to upload
 * @param {string} [name] optional name of the content, used to determine the filetype
 * @returns
 */
export async function uploadToAws(
  url: string,
  key: string,
  content: string | Buffer,
  name?: string
) {
  let contentType: string | undefined;

  if (typeof content !== 'string') {
    const type = fileType(content);
    if (type) {
      contentType = type.mime;
    }
  }

  if (name && !contentType) {
    contentType = mime.contentType(name) || undefined;
  }

  const resp = await got.put(url, {
    headers: {
      'x-amz-server-side-encryption': 'aws:kms',
      'x-amz-server-side-encryption-aws-kms-key-id': key,
      'Content-Type': contentType,
    },
    body: content,
  });
  return resp.body;
}
