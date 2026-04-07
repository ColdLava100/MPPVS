import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/database';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class VotingSessionsService {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  async create(data: any, userId: string) {
    const session = await prisma.votingSession.create({
      data: {
        electionId: data.electionId,
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        courseCode: data.courseCode,
        studentIdStart: data.studentIdStart,
        studentIdEnd: data.studentIdEnd,
      },
    });

    await this.auditLogsService.logAction(userId, 'CREATED_VOTING_SESSION', {
      sessionId: session.id,
      electionId: data.electionId,
    });

    return session;
  }
}
