import { Injectable, ForbiddenException } from '@nestjs/common';
import { prisma } from '@repo/database';

const EC_ACTIONS = [
  'CREATED_ELECTION',
  'UPDATED_ELECTION',
  'DELETED_ELECTION',
  'CREATED_VOTING_SESSION',
  'UPDATED_VOTING_SESSION',
  'DELETED_VOTING_SESSION',
  'UPDATED_CANDIDATE',
  'BULK_GENERATE_SECURITY_CODES',
  'GENERATE_SECURITY_CODE',
  'REGENERATE_ALL_SECURITY_CODES',
];

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

  async findAll(role: string) {
    if (role === 'SUPERADMIN') {
      return prisma.auditLog.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (role === 'SPR_ADVISOR' || role === 'SPR_VOLUNTEER') {
      return prisma.auditLog.findMany({
        where: {
          action: { in: EC_ACTIONS },
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    throw new ForbiddenException(
      'You do not have permission to view audit logs.',
    );
  }
}
