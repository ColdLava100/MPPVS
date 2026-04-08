import { Injectable, BadRequestException } from '@nestjs/common';
import { prisma } from '@repo/database';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class VotingSessionsService {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  async getVotingSessions() {
    return prisma.votingSession.findMany();
  }

  async create(data: any, userId: string) {
    if (!data.courseId) {
      throw new BadRequestException('courseId is required to create a voting session.');
    }

    const course = await prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) {
      throw new BadRequestException('Invalid course selected. Course does not exist.');
    }

    if (data.studentIdStart && !data.studentIdStart.startsWith(course.studentPrefix)) {
      throw new BadRequestException('Student ID range must match the selected course prefix.');
    }

    if (data.studentIdEnd && !data.studentIdEnd.startsWith(course.studentPrefix)) {
      throw new BadRequestException('Student ID range must match the selected course prefix.');
    }

    const session = await prisma.votingSession.create({
      data: {
        electionId: data.electionId,
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        courseCode: course.code,
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

  async updateVotingSession(id: string, data: any, userId: string) {
    let updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.startTime) updateData.startTime = data.startTime;
    if (data.endTime) updateData.endTime = data.endTime;
    if (data.electionId) updateData.electionId = data.electionId;

    if (data.courseId || data.studentIdStart || data.studentIdEnd) {
      const existingSession = await prisma.votingSession.findUnique({ where: { id } });
      if (!existingSession) throw new BadRequestException('Voting session not found');

      let courseCode = existingSession.courseCode;
      const existingCourse = await prisma.course.findUnique({ where: { code: courseCode } });
      let prefix = existingCourse?.studentPrefix || '';

      if (data.courseId) {
        const course = await prisma.course.findUnique({ where: { id: data.courseId } });
        if (!course) throw new BadRequestException('Invalid course selected.');
        courseCode = course.code;
        prefix = course.studentPrefix;
        updateData.courseCode = courseCode;
      }

      const checkStart = data.studentIdStart !== undefined ? data.studentIdStart : existingSession.studentIdStart;
      const checkEnd = data.studentIdEnd !== undefined ? data.studentIdEnd : existingSession.studentIdEnd;

      if (checkStart && !checkStart.startsWith(prefix)) {
        throw new BadRequestException(`Student ID range must match the course prefix ${prefix}.`);
      }
      if (checkEnd && !checkEnd.startsWith(prefix)) {
        throw new BadRequestException(`Student ID range must match the course prefix ${prefix}.`);
      }

      if (data.studentIdStart !== undefined) updateData.studentIdStart = data.studentIdStart || null;
      if (data.studentIdEnd !== undefined) updateData.studentIdEnd = data.studentIdEnd || null;
    }

    const session = await prisma.votingSession.update({
      where: { id },
      data: updateData,
    });

    await this.auditLogsService.logAction(userId, 'UPDATED_VOTING_SESSION', {
      sessionId: session.id,
      changes: Object.keys(updateData),
    });

    return session;
  }

  async deleteVotingSession(id: string, userId: string) {
    const session = await prisma.votingSession.delete({
      where: { id },
    });

    await this.auditLogsService.logAction(userId, 'DELETED_VOTING_SESSION', {
      sessionId: session.id,
    });

    return { success: true };
  }
}
