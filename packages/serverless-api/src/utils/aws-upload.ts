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

  console.log(name);
  if (typeof content !== 'string') {
    console.log('Hey there');
    const type = fileType(content);
    console.log(type);
    if (type) {
      contentType = type.mime;
    }
  }

  if (name && !contentType) {
    contentType = mime.contentType(name) || undefined;
  }

  console.log(contentType);
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
