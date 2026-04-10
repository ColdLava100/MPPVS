import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { prisma } from '@repo/database';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('2fa')
export class TwoFactorAuthController {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate(@Req() request: any) {
    // Assuming request.user exists from JwtAuthGuard
    // Fetch user to ensure we have the most up to date record if needed
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
    });

    const { secret, otpAuthUrl } =
      await this.twoFactorAuthService.generateTwoFactorAuthenticationSecret(
        user,
      );

    // Save secret to database
    await prisma.user.update({
      where: { id: request.user.id },
      data: { twoFactorAuthenticationSecret: secret } as any,
    });

    const qrCodeDataUrl =
      await this.twoFactorAuthService.generateQrCodeDataURL(otpAuthUrl);

    return { qrCodeDataUrl };
  }

  @Post('turn-on')
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(
    @Req() request: any,
    @Body('code') code: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
    });

    const isCodeValid =
      this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(code, user);

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

  @Post('turn-off')
  @UseGuards(JwtAuthGuard)
  async turnOffTwoFactorAuthentication(@Req() request: any) {
    await prisma.user.update({
      where: { id: request.user.id },
      data: {
        isTwoFactorAuthenticationEnabled: false,
        twoFactorAuthenticationSecret: null,
      } as any,
    });

    return { success: true };
  }

  @Post('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Req() request: any) {
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: { isTwoFactorAuthenticationEnabled: true },
    });

    return {
      isTwoFactorAuthenticationEnabled:
        user?.isTwoFactorAuthenticationEnabled || false,
    };
  }
}
