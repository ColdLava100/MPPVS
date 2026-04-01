import { Controller, Post, Body, Req, UnauthorizedException } from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { prisma } from '@repo/database';

@Controller('2fa')
export class TwoFactorAuthController {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

  @Post('generate')
  // @UseGuards(JwtAuthGuard)
  async generate(@Req() request: any) {
    // Assuming request.user exists from JwtAuthGuard
    // Fetch user to ensure we have the most up to date record if needed
    const user = await prisma.user.findUnique({
        where: { id: request.user.id }
    });

    const { secret, otpAuthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthenticationSecret(user);

    // Save secret to database
    await prisma.user.update({
        where: { id: request.user.id },
        data: { twoFactorAuthenticationSecret: secret } as any,
    });

    const qrCodeDataUrl = await this.twoFactorAuthService.generateQrCodeDataURL(otpAuthUrl);

    return { qrCodeDataUrl };
  }

  @Post('turn-on')
  // @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(
    @Req() request: any,
    @Body('twoFactorCode') twoFactorCode: string,
  ) {
    const user = await prisma.user.findUnique({
        where: { id: request.user.id }
    });

    const isCodeValid = this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
      twoFactorCode,
      user,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    // Enable 2FA for the user
    await prisma.user.update({
      where: { id: request.user.id },
      data: { isTwoFactorAuthenticationEnabled: true } as any,
    });

    return { success: true };
  }
}
