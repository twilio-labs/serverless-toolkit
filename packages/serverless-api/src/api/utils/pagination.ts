import debug from 'debug';
import { OptionsOfJSONResponseBody } from 'got';
import { BaseList, GotClient } from '../../types';
import { ClientApiError } from '../../utils/error';

const log = debug('twilio-serverless-api:utils:pagination');

export async function getPaginatedResource<
  TList extends BaseList<string>,
  TEntry
>(
  client: GotClient,
  url: string,
  opts: OptionsOfJSONResponseBody = { responseType: 'json' }
): Promise<TEntry[]> {
  let result: TEntry[] = [];

  opts = {
    ...opts,
  };

  let nextPageUrl: string | null = url;
  do {
    try {
      if (nextPageUrl.startsWith('http')) {
        opts.prefixUrl = undefined;
      }
      const resp = await client.get(nextPageUrl, opts);
      const body = resp.body as TList;
      nextPageUrl = body.meta.next_page_url;
      const entries = body[body.meta.key] as TEntry[];
      result = [...result, ...entries];
    } catch (err) {
      log('%O', new ClientApiError(err));

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
