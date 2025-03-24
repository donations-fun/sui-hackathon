import { Constants } from './constants';

export class CacheInfo {
  key: string = '';
  ttl: number = Constants.oneSecond() * 6;

  static TwitterCodeVerifier(address: string): CacheInfo {
    return {
      key: `twitterCodeVerifier:${address}`,
      ttl: Constants.oneMinute() * 15,
    };
  }
}
