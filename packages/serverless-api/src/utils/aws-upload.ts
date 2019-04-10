import got = require('got');

export async function uploadToAws(
  url: string,
  key: string,
  content: string | Buffer
) {
  const resp = await got.put(url, {
    headers: {
      'x-amz-server-side-encryption': 'aws:kms',
      'x-amz-server-side-encryption-aws-kms-key-id': key,
    },
    body: content,
  });
  return resp.body;
}
