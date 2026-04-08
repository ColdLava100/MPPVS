import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/database';

@Injectable()
export class AuditLogsService {
  async logAction(userId: string, action: string, details?: any) {
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        details: details ?? {},
      },
    });
  }
}
