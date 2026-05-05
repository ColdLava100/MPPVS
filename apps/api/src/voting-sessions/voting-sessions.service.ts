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
      throw new BadRequestException(
        'courseId is required to create a voting session.',
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });
    if (!course) {
      throw new BadRequestException(
        'Invalid course selected. Course does not exist.',
      );
    }

    if (
      data.studentIdStart &&
      !data.studentIdStart.startsWith(course.studentPrefix)
    ) {
      throw new BadRequestException(
        'Student ID range must match the selected course prefix.',
      );
    }

    if (
      data.studentIdEnd &&
      !data.studentIdEnd.startsWith(course.studentPrefix)
    ) {
      throw new BadRequestException(
        'Student ID range must match the selected course prefix.',
      );
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
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.startTime) updateData.startTime = data.startTime;
    if (data.endTime) updateData.endTime = data.endTime;
    if (data.electionId) updateData.electionId = data.electionId;

    if (data.courseId || data.studentIdStart || data.studentIdEnd) {
      const existingSession = await prisma.votingSession.findUnique({
        where: { id },
      });
      if (!existingSession)
        throw new BadRequestException('Voting session not found');

      let courseCode = existingSession.courseCode;
      const existingCourse = await prisma.course.findUnique({
        where: { code: courseCode },
      });
      let prefix = existingCourse?.studentPrefix || '';

      if (data.courseId) {
        const course = await prisma.course.findUnique({
          where: { id: data.courseId },
        });
        if (!course) throw new BadRequestException('Invalid course selected.');
        courseCode = course.code;
        prefix = course.studentPrefix;
        updateData.courseCode = courseCode;
      }

      const checkStart =
        data.studentIdStart !== undefined
          ? data.studentIdStart
          : existingSession.studentIdStart;
      const checkEnd =
        data.studentIdEnd !== undefined
          ? data.studentIdEnd
          : existingSession.studentIdEnd;

      if (checkStart && !checkStart.startsWith(prefix)) {
        throw new BadRequestException(
          `Student ID range must match the course prefix ${prefix}.`,
        );
      }
      if (checkEnd && !checkEnd.startsWith(prefix)) {
        throw new BadRequestException(
          `Student ID range must match the course prefix ${prefix}.`,
        );
      }

      if (data.studentIdStart !== undefined)
        updateData.studentIdStart = data.studentIdStart || null;
      if (data.studentIdEnd !== undefined)
        updateData.studentIdEnd = data.studentIdEnd || null;
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

  async getSessionVoters(sessionId: string) {
    const session = await prisma.votingSession.findUnique({
      where: { id: sessionId },
      include: {
        election: true,
      },
    });

    if (!session) {
      throw new BadRequestException('Voting session not found');
    }

    const whereClause: any = {
      electionId: session.electionId,
      isArchived: false,
    };

    const registrations = await prisma.voterRegistration.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            course: true,
          },
        },
      },
    });

    const filteredVoters = registrations
      .filter((reg) => {
        const user = reg.user;
        if (!user) return false;
        if (user.isArchived) return false;

        if (session.courseCode) {
          if (user.course?.code !== session.courseCode) return false;
        }

        if (session.studentIdStart && session.studentIdEnd) {
          const userStudentId = user.studentId;
          if (!userStudentId) return false;
          if (
            userStudentId < session.studentIdStart ||
            userStudentId > session.studentIdEnd
          ) {
            return false;
          }
        } else if (session.studentIdStart) {
          const userStudentId = user.studentId;
          if (!userStudentId) return false;
          if (userStudentId < session.studentIdStart) return false;
        } else if (session.studentIdEnd) {
          const userStudentId = user.studentId;
          if (!userStudentId) return false;
          if (userStudentId > session.studentIdEnd) return false;
        }

        return true;
      })
      .map((reg) => reg.user);

    const voterIds = filteredVoters.map((v) => v.id);

    const votes = await prisma.vote.findMany({
      where: {
        voterId: { in: voterIds },
        electionId: session.electionId,
      },
    });

    const votedVoterIds = new Set(votes.map((v) => v.voterId));

    return filteredVoters.map((user) => ({
      userId: user.id,
      name: user.name,
      studentId: user.studentId || 'N/A',
      icNumber: user.icNumber || 'N/A',
      courseCode: user.course?.code || 'N/A',
      hasVoted: votedVoterIds.has(user.id),
      votedAt: votes.find((v) => v.voterId === user.id)?.createdAt || null,
    }));
  }

  async getSessionCandidates(sessionId: string) {
    const session = await prisma.votingSession.findUnique({
      where: { id: sessionId },
      include: { election: true },
    });

    if (!session) {
      throw new BadRequestException('Voting session not found');
    }

    const candidates = await prisma.candidate.findMany({
      where: { electionId: session.electionId, status: 'APPROVED' },
      include: { user: { include: { course: true } } },
    });

    const votes = await prisma.vote.findMany({
      where: {
        electionId: session.electionId,
        createdAt: {
          gte: session.startTime,
          lte: session.endTime,
        },
      },
    });

    const voteCounts: Record<string, number> = {};
    votes.forEach((v) => {
      voteCounts[v.candidateId] = (voteCounts[v.candidateId] || 0) + 1;
    });

    return candidates.map((c) => ({
      id: c.id,
      name: c.user?.name || 'Unknown',
      courseCode: c.user?.course?.code || 'N/A',
      voteCount: voteCounts[c.id] || 0,
    }));
  }
}
