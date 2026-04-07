import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@repo/database';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {}

    async studentLogin(studentId: string, icNumber: string) {
        const user = await prisma.user.findUnique({
            where: { studentId },
        });

        if (!user || user.icNumber !== icNumber) {
            throw new UnauthorizedException('Invalid student credentials');
        }

        const payload = { sub: user.id, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async staffLogin(email: string, pass: string) {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || user.password === 'not-used-for-students') {
            throw new UnauthorizedException('Invalid staff credentials');
        }

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid staff credentials');
        }

        if (['STUDENT', 'CANDIDATE'].includes(user.role)) {
            throw new UnauthorizedException('Invalid staff credentials');
        }

        const payload = { sub: user.id, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
}
