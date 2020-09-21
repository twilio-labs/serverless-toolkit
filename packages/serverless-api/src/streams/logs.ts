import { Readable } from 'stream';
import { listOnePageLogResources } from '../api/logs';
import { TwilioServerlessApiClient } from '../client';
import { Sid } from '../types';
import { LogsConfig } from '../types/logs';

export class LogsStream extends Readable {
  private _pollingFrequency: number;
  private _pollingCacheSize: number;
  private _interval: NodeJS.Timeout | undefined;
  private _viewedSids: Set<Sid>;

  constructor(
    private environmentSid: Sid,
    private serviceSid: Sid,
    private client: TwilioServerlessApiClient,
    private config: LogsConfig
  ) {
    super({ objectMode: true });
    this._interval = undefined;
    this._viewedSids = new Set();
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
        .filter(log => !this._viewedSids.has(log.sid))
        .reverse()
        .forEach(log => {
          this.push(log);
        });

      // The logs endpoint is not reliably returning logs in the same order
      // Therefore we need to keep a set of all previously seen log entries
      // In order to avoid memory leaks we cap the total size of logs at 1000
      // If the new set is larger we'll instead only use the SIDs from the current
      // request.
      if (logs.length + this._viewedSids.size <= this._pollingCacheSize) {
        logs.map(log => log.sid).forEach(sid => this._viewedSids.add(sid));
      } else {
        this._viewedSids = new Set(logs.map(log => log.sid));
      }
      if (!this.config.tail) {
        this.push(null);
      }
    } catch (err) {
      this.destroy(err);
    }
  }

  _read() {
    if (this.config.tail && !this._interval) {
      this._interval = setInterval(() => {
        this._poll();
      }, this._pollingFrequency);
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
