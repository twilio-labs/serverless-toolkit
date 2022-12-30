import { Readable } from 'stream';
import { listOnePageLogResources } from '../api/logs';
import { TwilioServerlessApiClient } from '../client';
import { Sid } from '../types';
import { LogsConfig } from '../types/logs';

export class LogsStream extends Readable {
  private _pollingFrequency: number;
  private _pollingCacheSize: number;
  // The builds become flaky if this is set to NodeJS.Timer or number as type because TypeScript sometimes infers the wrong one of the two. This solves this problem:
  // https://stackoverflow.com/questions/55550096/ts2322-type-timeout-is-not-assignable-to-type-number-when-running-unit-te
  private _interval: ReturnType<typeof setTimeout> | undefined;
  private _viewedSids: Set<Sid>;
  private _viewedLogs: Array<{ sid: Sid; dateCreated: Date }>;

  constructor(
    private environmentSid: Sid,
    private serviceSid: Sid,
    private client: TwilioServerlessApiClient,
    private config: LogsConfig
  ) {
    super({ objectMode: true });
    this._interval = undefined;
    this._viewedSids = new Set();
    this._viewedLogs = [];
    this._pollingFrequency = config.pollingFrequency || 1000;
    this._pollingCacheSize = config.logCacheSize || 1000;
  }

  set pollingFrequency(frequency: number) {
    this._pollingFrequency = frequency;
    if (this.config.tail && this._interval) {
      clearInterval(this._interval);
      this._interval = setInterval(() => {
        this._poll();
      }, this._pollingFrequency);
    }
  }

  async _poll() {
    try {
      const logs = await listOnePageLogResources(
        this.environmentSid,
        this.serviceSid,
        this.client,
        {
          functionSid: this.config.filterByFunction,
          pageSize: this.config.limit,
        }
      );
      logs
        .filter((log) => !this._viewedSids.has(log.sid))
        .reverse()
        .forEach((log) => {
          this.push(log);
        });

      // The logs endpoint is not reliably returning logs in the same order
      // Therefore we need to keep a set of all previously seen log entries
      // In order to avoid memory leaks we cap the total size of logs at 1000
      // (or the set pollingCacheSize).
      //
      // We store an array of the logs' SIDs and created dates.
      // Then when a new page of logs is added, we find the unique logs, sort by
      // date created, newest to oldest, and chop off the end of the array (the
      // oldest logs) leaving the most recent logs in memory. We then turn that
      // into a set of SIDs to check against next time.

      // Creates a unique set of log sids and date created from previous logs
      // and new logs by stringifying the sid and the date together.
      const viewedLogsSet = new Set([
        ...this._viewedLogs.map(
          (log) => `${log.sid}-${log.dateCreated.toISOString()}`
        ),
        ...logs.map((log) => `${log.sid}-${log.date_created}`),
      ]);
      // Then we take that set, map over the logs and split them up into sid and
      // date again, sort them most to least recent and chop off the oldest if
      // they are beyond the polling cache size.
      this._viewedLogs = [...viewedLogsSet]
        .map((logString) => {
          const [sid, dateCreated] = logString.split('-');
          return { sid, dateCreated: new Date(dateCreated) };
        })
        .sort((a, b) => b.dateCreated.valueOf() - a.dateCreated.valueOf())
        .slice(0, this._pollingCacheSize);
      // Finally we create a set of just SIDs to compare against.
      this._viewedSids = new Set(this._viewedLogs.map((log) => log.sid));

      if (!this.config.tail) {
        this.push(null);
      }
    } catch (err) {
      if (err instanceof Error) {
        this.destroy(err);
      }
    }
  }

  _read() {
    if (this.config.tail) {
      if (!this._interval) {
        this._interval = setInterval(() => {
          this._poll();
        }, this._pollingFrequency);
      }
    } else {
      this._poll();
    }
  }

  _destroy() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = undefined;
    }
  }
}
