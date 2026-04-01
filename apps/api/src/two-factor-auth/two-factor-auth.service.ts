import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class TwoFactorAuthService {
  public async generateTwoFactorAuthenticationSecret(user: any) {
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(user.email, 'MPPVS System', secret);
    
    return {
      secret,
      otpAuthUrl,
    };
  }

  public async generateQrCodeDataURL(otpAuthUrl: string): Promise<string> {
    try {
      return await toDataURL(otpAuthUrl);
    } catch (e) {
      throw new InternalServerErrorException('Error generating QR code');
    }
  }

  public isTwoFactorAuthenticationCodeValid(twoFactorCode: string, user: any): boolean {
    if (!user.twoFactorAuthenticationSecret) {
      return false;
    }
    return authenticator.verify({
      token: twoFactorCode,
      secret: user.twoFactorAuthenticationSecret,
    });
  }
}
