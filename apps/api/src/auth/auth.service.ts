import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@repo/database';

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
}
