import { HttpException, Injectable, Logger } from '@nestjs/common';
import TwitterApi from 'twitter-api-v2';
import { ApiConfigService } from '@monorepo/common/config/api.config.service';
import { UserRepository } from '@monorepo/common/database/repository/user.repository';
import { JwtService } from '@nestjs/jwt';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';
import { InMemoryCacheService } from '@monorepo/common/utils/in-memory-cache';
import { CacheInfo } from '@monorepo/common/utils/cache.info';

@Injectable()
export class TwitterService {
  private readonly twitterClient: TwitterApi;
  private readonly logger = new Logger(TwitterService.name);

  constructor(
    private readonly apiConfigService: ApiConfigService,
    private readonly cache: InMemoryCacheService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {
    this.twitterClient = new TwitterApi({
      clientId: this.apiConfigService.getTwitterClientId(),
      clientSecret: this.apiConfigService.getTwitterClientSecret(),
    });
  }

  public async hasTwitterAccount(address: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findByAddress(address);
      return user?.twitterUsername !== undefined;
    } catch (e) {
      return false;
    }
  }

  public async generateTwitterAuthUrl(address: string): Promise<string> {
    const callbackURL = this.apiConfigService.getTwitterCallbackUrl();

    const { url, codeVerifier, state } = this.twitterClient.generateOAuth2AuthLink(callbackURL, {
      scope: ['tweet.read', 'users.read'],
    });

    const cacheInfo = CacheInfo.TwitterCodeVerifier(address);
    this.cache.set(cacheInfo.key, { state, codeVerifier }, cacheInfo.ttl);

    return url;
  }

  public async validateOauth(state: string, code: string, address: string, signature: string) {
    this.logger.log(`[${address}] validation oauth data`);

    const { state: storedState, codeVerifier } = await this.cache.get<any>(CacheInfo.TwitterCodeVerifier(address).key);

    if (storedState !== state) {
      throw new Error('Stored state does not match!');
    }

    const isValidSignature = await this.verifyOauthSignature(state, code, address, signature);

    if (!isValidSignature) {
      throw new Error('Invalid signature');
    }

    const callbackURL = this.apiConfigService.getTwitterCallbackUrl();

    const { client: loggedClient } = await this.twitterClient.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: callbackURL,
    });

    const { data: twitterData } = await loggedClient.v2.me();

    const existingUserWithAddress = await this.userRepository.findByAddress(address);
    if (existingUserWithAddress && existingUserWithAddress?.twitterId !== twitterData.id) {
      throw new HttpException('This address is already associated with a different X account.', 409);
    }

    const existingUserWithTwitter = await this.userRepository.findByTwitterId(twitterData.id);
    if (existingUserWithTwitter && existingUserWithTwitter.addresses.includes(address)) {
      throw new HttpException('This X account is already associated with this address.', 409);
    }

    await this.userRepository.updateUserTwitter(address, twitterData);

    await this.cache.delete(CacheInfo.TwitterCodeVerifier(address).key);

    const jwt = await this.jwtService.signAsync({ sub: address, twitterUsername: twitterData.username });

    return {
      jwt,
      twitterUsername: twitterData.username,
      address,
    };
  }

  public async reAuth(timestamp: number, address: string, signature: string) {
    this.logger.log(`[${address}] re-authing`);

    const existingUserWithAddress = await this.userRepository.findByAddress(address);

    if (!existingUserWithAddress || !existingUserWithAddress.twitterUsername) {
      throw new HttpException('This address is not associated with a X account.', 400);
    }

    const isValidSignature = await this.verifyReAuthSignature(timestamp, address, signature);

    if (!isValidSignature) {
      throw new Error('Invalid signature');
    }

    const jwt = await this.jwtService.signAsync({
      sub: address,
      twitterUsername: existingUserWithAddress.twitterUsername,
    });

    return {
      jwt,
      twitterUsername: existingUserWithAddress.twitterUsername,
      address,
    };
  }

  async verifyOauthSignature(state: string, code: string, expectedAddress: string, signature: string) {
    const value = {
      state,
      code,
    };

    try {
      const publicKey = await verifyPersonalMessageSignature(
        new TextEncoder().encode(JSON.stringify(value)),
        signature,
      );

      return publicKey.toSuiAddress().toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  async verifyReAuthSignature(timestamp: number, expectedAddress: string, signature: string) {
    const message = 'Sign this message to authenticate on donations.fun';
    const now = Date.now();

    if (timestamp < now - 60_000 || timestamp > now) {
      throw new HttpException('Signing took too long', 400);
    }

    const value = {
      message,
      timestamp,
    };

    try {
      const publicKey = await verifyPersonalMessageSignature(
        new TextEncoder().encode(JSON.stringify(value)),
        signature,
      );

      return publicKey.toSuiAddress().toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }
}
