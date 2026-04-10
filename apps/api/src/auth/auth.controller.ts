import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { TwoFactorAuthService } from '../two-factor-auth/two-factor-auth.service';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@repo/database';

class StudentLoginDto {
  studentId: string;
  icNumber: string;
}

class StaffLoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  @Post('student/login')
  async studentLogin(
    @Body() body: StudentLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.studentLogin(
      body.studentId,
      body.icNumber,
    );
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
    return result;
  }

  @Post('staff/login')
  async staffLogin(
    @Body() body: StaffLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.staffLogin(body.email, body.password);

    // If 2FA required, don't set cookie - return requires2FA flag
    if (result.requires2FA) {
      return result; // { requires2FA: true, email: ... }
    }

    // Normal login - set cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
    return result;
  }

  @Post('login/2fa')
  async loginWith2FA(
    @Body() body: { email: string; code: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user || !user.isTwoFactorAuthenticationEnabled) {
      throw new UnauthorizedException('Invalid request');
    }

    // Verify 2FA code using existing service
    const isCodeValid =
      this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
        body.code,
        user,
      );

    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Generate JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return { accessToken };
  }

  @Post('impersonate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  async impersonate(
    @Body() body: { targetUserId: string },
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const superadminId = req.user?.id || req.user?.sub;
    const result = await this.authService.impersonateUser(
      body.targetUserId,
      superadminId,
    );

    if (req.cookies && req.cookies.accessToken) {
      res.cookie('originalToken', req.cookies.accessToken, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // Overwrite with 1 day
      path: '/',
    });

    return result;
  }

  @Post('stop-impersonation')
  async stopImpersonation(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const originalToken = req.cookies?.originalToken;
    if (!originalToken) {
      throw new BadRequestException('No original session found');
    }

    res.cookie('accessToken', originalToken, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.clearCookie('originalToken', { path: '/' });

    return { success: true };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', { path: '/' });
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() request: any) {
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isTwoFactorAuthenticationEnabled: true,
      },
    });

    // Check if user is impersonating by looking for originalToken cookie
    const isImpersonating = !!request.cookies?.originalToken;

    return { ...user, isImpersonating };
  }
}
