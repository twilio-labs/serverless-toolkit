import { Sid } from '../../types';

const SidRegEx = /^[A-Z]{2}[a-f0-9]{32}$/;

export function isSid(value: unknown): value is Sid {
  if (typeof value !== 'string') {
    return false;
  }

  if (value.length !== 34) {
    return false;
  }

  return SidRegEx.test(value);
}
