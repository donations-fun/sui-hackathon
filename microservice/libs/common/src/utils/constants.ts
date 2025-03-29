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

export const SUI_TOKEN_TYPE_NAME = '0x2::sui::SUI';
export const SUI_TOKEN_TYPE_NAME_LONG = '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI';
