import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

class StudentLoginDto {
    studentId: string;
    icNumber: string;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('student/login')
    async studentLogin(@Body() body: StudentLoginDto) {
        return this.authService.studentLogin(body.studentId, body.icNumber);
    }
}
