import debug from 'debug';
import got from 'got';
import { BaseList, GotClient } from '../../types';

const log = debug('twilio-serverless-api:utils:pagination');

export async function getPaginatedResource<
  TList extends BaseList<string>,
  TEntry
>(
  client: GotClient,
  url: string,
  opts: got.GotJSONOptions = { json: true }
): Promise<TEntry[]> {
  let result: TEntry[] = [];

  opts = {
    ...opts,
  };

  let nextPageUrl: string | null = url;
  do {
    try {
      const resp = await client.get(nextPageUrl, opts);
      const body = resp.body as TList;
      nextPageUrl = body.meta.next_page_url;
      const entries = body[body.meta.key] as TEntry[];
      result = [...result, ...entries];
    } catch (err) {
      log('%O', err);

      // if the first request failed, throw error
      if (nextPageUrl === url) {
        throw err;
      } else {
        break;
      }
    }
  } while (nextPageUrl !== null);

  return result;
}
