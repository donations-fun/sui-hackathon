import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiConfigService {
  constructor(private readonly configService: ConfigService) {}

  getCorsOrigin(): string[] {
    const origin = this.configService.get<string>('CORS_ORIGIN');
    if (origin === undefined) {
      throw new Error('No CORS Origin present');
    }

    return origin.split(',');
  }

  getTwitterClientId(): string {
    const twitterClientId = this.configService.get<string>('TWITTER_CLIENT_ID');
    if (!twitterClientId) {
      throw new Error('No Twitter Client ID present');
    }

    return twitterClientId;
  }

  getTwitterClientSecret(): string {
    const twitterClientSecret = this.configService.get<string>('TWITTER_CLIENT_SECRET');
    if (!twitterClientSecret) {
      throw new Error('No Twitter Client Secret present');
    }

    return twitterClientSecret;
  }

  getTwitterCallbackUrl(): string {
    const twitterCallbackUrl = this.configService.get<string>('TWITTER_CALLBACK_URL');
    if (!twitterCallbackUrl) {
      throw new Error('No Twitter Callback Url present');
    }

    return twitterCallbackUrl;
  }

  getJwtPublicKey(): string {
    const jwtPublicKey = this.configService.get<string>("JWT_PUBLIC_KEY");
    if (!jwtPublicKey) {
      throw new Error("No JWT Public Key present");
    }

    return jwtPublicKey.replace(/\\n/gm, "\n");
  }

  getJwtPrivateKey(): string {
    const jwtPrivateKey = this.configService.get<string>("JWT_PRIVATE_KEY");
    if (!jwtPrivateKey) {
      throw new Error("No JWT Private Key present");
    }

    return jwtPrivateKey.replace(/\\n/gm, "\n");
  }
}
