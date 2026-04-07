import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/database';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class ElectionsService {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  async create(courseSettings: any, userId: string) {
    const election = await prisma.election.create({
      data: {
        title: 'New Election', // Default placeholder, can be enhanced
        courseSettings: courseSettings,
      },
    });

    await this.auditLogsService.logAction(userId, 'CREATED_ELECTION', {
      id: election.id,
      courseSettings,
    });

    return election;
  }
}

