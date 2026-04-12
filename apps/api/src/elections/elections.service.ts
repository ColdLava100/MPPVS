import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/database';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

/**
 * Parses a naive local datetime string (e.g. "2026-04-15T09:00" or "2026-04-15T09:00:00")
 * as Malaysia Time (UTC+8) and returns a proper UTC Date object.
 *
 * Strategy: TRUE UTC (Strategy B)
 * - Frontend sends a naive MYT string (no offset, no Z).
 * - We attach the +08:00 offset so JavaScript/Node parses it as MYT.
 * - The resulting Date object is internally UTC (01:00:00Z for a 09:00 MYT input).
 * - Prisma stores this UTC value in PostgreSQL. DBeaver will show UTC unless its
 *   connection is configured to display MYT — that is a DBeaver display setting,
 *   not a data integrity issue.
 * - auth.service.ts uses new Date() which is also UTC, so comparisons are correct.
 */
function parseLocalDateTime(dateTimeStr: string | null | undefined): Date | null {
  if (!dateTimeStr) return null;

  try {
    // 1. Strip any accidental trailing offset/Z the frontend might include
    const bare = dateTimeStr.replace(/(Z|[+-]\d{2}:?\d{2})$/, '');

    // 2. Split into Date and Time
    const [datePart, timePart] = bare.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    // 3. Force TRUE UTC creation (Subtract 8 hours from local MYT)
    const parsed = new Date(Date.UTC(year, month - 1, day, hour - 8, minute, 0));

    if (isNaN(parsed.getTime())) {
      console.error('[parseLocalDateTime] Invalid date constructed:', dateTimeStr);
      return null;
    }

    console.log(
      '[DEBUG] parseLocalDateTime input (MYT):', dateTimeStr,
      '→ stored UTC:', parsed.toISOString(),
      '→ MYT display:', parsed.toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })
    );

    return parsed;
  } catch (err) {
    console.error("[parseLocalDateTime] Fatal parsing error for:", dateTimeStr, err);
    return null;
  }
}

@Injectable()
export class ElectionsService {
  constructor(private readonly auditLogsService: AuditLogsService) { }

  async getElections() {
    return prisma.election.findMany();
  }

  async getElectionById(id: string) {
    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        sessions: true,
        candidates: {
          include: {
            user: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });
    if (!election) {
      throw new NotFoundException('Election not found');
    }
    return election;
  }

  async getElectionVoters(
    electionId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      status?: 'all' | 'hasVoted' | 'notVoted';
      course?: string;
    }
  ) {
    const { page = 1, limit = 50, search, status = 'all', course } = options;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      electionId,
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

    const votes = await prisma.vote.findMany({
      where: { electionId },
    });
    const votedVoterIds = new Set(votes.map(v => v.voterId));

    let filteredVoters = registrations
      .filter(reg => {
        const user = reg.user;
        if (!user || user.isArchived) return false;

        if (course && user.course?.code !== course) return false;

        if (search) {
          const searchLower = search.toLowerCase();
          const nameMatch = user.name?.toLowerCase().includes(searchLower);
          const idMatch = user.studentId?.toLowerCase().includes(searchLower);
          if (!nameMatch && !idMatch) return false;
        }

        if (status === 'hasVoted' && !votedVoterIds.has(user.id)) return false;
        if (status === 'notVoted' && votedVoterIds.has(user.id)) return false;

        return true;
      })
      .map(reg => {
        const user = reg.user;
        const hasVoted = votedVoterIds.has(user.id);
        const vote = votes.find(v => v.voterId === user.id);
        return {
          id: reg.id,
          userId: user.id,
          name: user.name,
          studentId: user.studentId,
          courseCode: user.course?.code || 'N/A',
          courseName: user.course?.name || 'N/A',
          hasVoted,
          votedAt: vote?.createdAt || null,
        };
      });

    const total = filteredVoters.length;
    const paginatedVoters = filteredVoters.slice(skip, skip + limit);

    return {
      data: paginatedVoters,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getElectionCandidates(electionId: string) {
    console.log('[DEBUG] getElectionCandidates called with electionId:', electionId);
    
    const candidates = await prisma.candidate.findMany({
      where: { 
        electionId,
        status: 'APPROVED',
      },
      include: {
        user: {
          include: {
            course: true,
          },
        },
      },
    });

    console.log('[DEBUG] Found', candidates.length, 'APPROVED candidates for electionId:', electionId);
    
    // Debug: Log each candidate details
    candidates.forEach((c, i) => {
      console.log(`[DEBUG] Candidate ${i+1}:`, {
        id: c.id,
        status: c.status,
        userId: c.userId,
        userName: c.user?.name,
        userStudentId: c.user?.studentId,
        courseCode: c.user?.course?.code,
        coursePrefix: c.user?.course?.studentPrefix,
      });
    });

    const votes = await prisma.vote.findMany({
      where: { electionId },
    });

    return candidates.map(candidate => {
      const voteCount = votes.filter(v => v.candidateId === candidate.id).length;
      return {
        id: candidate.id,
        name: candidate.user?.name || 'Unknown',
        studentId: candidate.user?.studentId || 'N/A',
        courseCode: candidate.user?.course?.code || 'N/A',
        courseName: candidate.user?.course?.name || 'N/A',
        voteCount,
        user: {
          name: candidate.user?.name,
          studentId: candidate.user?.studentId,
          email: candidate.user?.email,
          course: {
            code: candidate.user?.course?.code,
            name: candidate.user?.course?.name,
            studentPrefix: candidate.user?.course?.studentPrefix || null,
          },
        },
      };
    });
  }

  async getElectionSessions(electionId: string) {
    const sessions = await prisma.votingSession.findMany({
      where: { electionId },
    });

    const registrations = await prisma.voterRegistration.findMany({
      where: { electionId, isArchived: false },
      include: { user: { include: { course: true } } },
    });

    const votes = await prisma.vote.findMany({
      where: { electionId },
    });
    const votedVoterIds = new Set(votes.map(v => v.voterId));

    return sessions.map(session => {
      const sessionVoters = registrations.filter(reg => {
        const user = reg.user;
        if (!user || user.isArchived) return false;
        if (session.courseCode && user.course?.code !== session.courseCode) return false;

        if (session.studentIdStart && session.studentIdEnd) {
          if (!user.studentId) return false;
          if (user.studentId < session.studentIdStart || user.studentId > session.studentIdEnd) return false;
        }

        return true;
      });

      const votedCount = sessionVoters.filter(v => votedVoterIds.has(v.userId)).length;

      return {
        id: session.id,
        title: session.title,
        courseCode: session.courseCode,
        startTime: session.startTime,
        endTime: session.endTime,
        studentIdStart: session.studentIdStart,
        studentIdEnd: session.studentIdEnd,
        totalVoters: sessionVoters.length,
        votedCount,
      };
    });
  }

  async create(title: string, courseSettings: any, userId: string, startDate?: string, endDate?: string) {
    console.log('[DEBUG] createElection received:', { startDate, endDate });
    console.log('[DEBUG] Parsed startDate:', parseLocalDateTime(startDate)?.toISOString());
    console.log('[DEBUG] Parsed endDate:', parseLocalDateTime(endDate)?.toISOString());

    const election = await prisma.election.create({
      data: {
        title: title || 'New Election',
        courseSettings: courseSettings,
        startDate: parseLocalDateTime(startDate),
        endDate: parseLocalDateTime(endDate),
      },
    });

    await this.auditLogsService.logAction(userId, 'CREATED_ELECTION', {
      id: election.id,
      title: election.title,
    });

    return election;
  }

  async updateElection(id: string, data: any, userId: string) {
    console.log('[DEBUG] updateElection received:', { id, startDate: data.startDate, endDate: data.endDate });

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.courseSettings !== undefined) updateData.courseSettings = data.courseSettings;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.startDate !== undefined) {
      updateData.startDate = parseLocalDateTime(data.startDate);
      console.log('[DEBUG] Parsed startDate:', updateData.startDate?.toISOString());
    }
    if (data.endDate !== undefined) {
      updateData.endDate = parseLocalDateTime(data.endDate);
      console.log('[DEBUG] Parsed endDate:', updateData.endDate?.toISOString());
    }

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
