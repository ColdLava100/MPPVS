import { Controller, Post, Body, Res, Req, UseGuards, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

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
    constructor(private readonly authService: AuthService) {}

    @Post('student/login')
    async studentLogin(@Body() body: StudentLoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.studentLogin(body.studentId, body.icNumber);
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        });
        return result;
    }

    @Post('staff/login')
    async staffLogin(@Body() body: StaffLoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.staffLogin(body.email, body.password);
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        });
        return result;
    }

    @Post('impersonate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.SUPERADMIN)
    async impersonate(@Body() body: { targetUserId: string }, @Req() req: any, @Res({ passthrough: true }) res: Response) {
        const superadminId = req.user?.id || req.user?.sub;
        const result = await this.authService.impersonateUser(body.targetUserId, superadminId);
        
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
            path: '/'
        });
        
        return result;
    }

    @Post('stop-impersonation')
    async stopImpersonation(@Req() req: any, @Res({ passthrough: true }) res: Response) {
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
}
