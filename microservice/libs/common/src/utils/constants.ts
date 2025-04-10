export class Constants {
  static oneSecond(): number {
    return 1;
  }

  static oneMinute(): number {
    return Constants.oneSecond() * 60;
  }

  static oneHour(): number {
    return Constants.oneMinute() * 60;
  }

  static oneDay(): number {
    return Constants.oneHour() * 24;
  }

  static oneWeek(): number {
    return Constants.oneDay() * 7;
  }

  static oneMonth(): number {
    return Constants.oneDay() * 30;
  }
}

export const SUI_TOKEN_TYPE = '0x2::sui::SUI';
export const SUI_TOKEN_TYPE_LONG = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI';

export const SUI_AXELAR_CHAIN = "sui-2"; // TODO: Update when going to mainnet

export const ALL_AXELAR_CHAINS = [SUI_AXELAR_CHAIN, 'eth-sepolia']; // TODO: Update these
