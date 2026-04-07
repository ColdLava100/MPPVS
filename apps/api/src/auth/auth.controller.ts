import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';

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
}
