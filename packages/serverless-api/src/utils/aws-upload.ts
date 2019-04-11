import fileType from 'file-type';
import got from 'got';
import mime from 'mime-types';

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
