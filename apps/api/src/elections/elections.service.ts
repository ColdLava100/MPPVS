import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/database';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class ElectionsService {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  async getElections() {
    return prisma.election.findMany();
  }

  async create(title: string, courseSettings: any, userId: string) {
    const election = await prisma.election.create({
      data: {
        title: title || 'New Election',
        courseSettings: courseSettings,
      },
    });

    await this.auditLogsService.logAction(userId, 'CREATED_ELECTION', {
      id: election.id,
      title: election.title,
    });

    return election;
  }

  async updateElection(id: string, data: any, userId: string) {
    let updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.courseSettings) updateData.courseSettings = data.courseSettings;
    if (data.status) updateData.status = data.status;

    const election = await prisma.election.update({
      where: { id },
      data: updateData,
    });

    await this.auditLogsService.logAction(userId, 'UPDATED_ELECTION', {
      id: election.id,
      changes: Object.keys(updateData),
    });

    return election;
  }

  async deleteElection(id: string, userId: string) {
    // Delete associated voting sessions first (cascade simulation)
    await prisma.votingSession.deleteMany({
      where: { electionId: id },
    });

    const election = await prisma.election.delete({
      where: { id },
    });

    await this.auditLogsService.logAction(userId, 'DELETED_ELECTION', {
      id: election.id,
    });

    return { success: true };
  }
}
