import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

export interface VerifiedGoogleUser {
  sub: string;
  email: string;
  name?: string;
}

@Injectable()
export class GoogleIdTokenVerifier {
  private readonly logger = new Logger(GoogleIdTokenVerifier.name);
  private client: OAuth2Client;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID || 'demo-google-client-id';
    this.client = new OAuth2Client(clientId);
  }

  async verify(idToken: string): Promise<VerifiedGoogleUser> {
    if (!idToken) {
      throw new UnauthorizedException({
        errorCode: 'ADMIN_ID_TOKEN_REQUIRED',
        message: 'Google ID Token là bắt buộc để đăng nhập Admin.',
      });
    }

    // In unit test environment, support mock token format
    if (process.env.NODE_ENV === 'test' && idToken.startsWith('mock-google-id-token-')) {
      const email = idToken.replace('mock-google-id-token-', '');
      return {
        sub: `google-sub-${email}`,
        email,
        name: `Test Staff (${email})`,
      };
    }

    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.sub) {
        throw new UnauthorizedException({
          errorCode: 'ADMIN_ID_TOKEN_INVALID',
          message: 'Google ID Token không chứa đầy đủ thông tin xác thực email.',
        });
      }

      return {
        sub: payload.sub,
        email: payload.email.toLowerCase(),
        name: payload.name,
      };
    } catch (err: any) {
      this.logger.warn(`Google ID Token verification failed: ${err.message}`);
      throw new UnauthorizedException({
        errorCode: 'ADMIN_ID_TOKEN_INVALID',
        message: 'Google ID Token không hợp lệ hoặc đã hết hạn.',
      });
    }
  }
}
