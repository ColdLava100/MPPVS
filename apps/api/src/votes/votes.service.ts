import {
  Injectable,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { prisma } from '@repo/database';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class VotesService {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  async submitVote(
    voterId: string,
    electionId: string,
    candidateIds: string[],
  ) {
    // Rule 0: Check if user is registered for this election
    const registration = await prisma.voterRegistration.findFirst({
      where: {
        userId: voterId,
        electionId,
        isArchived: false,
      },
    });

    if (!registration) {
      throw new ForbiddenException('You are not registered for this election.');
    }

    // Rule 0.5: Check voting session time window & student range
    const sessions = await prisma.votingSession.findMany({
      where: { electionId },
    });

    if (sessions.length > 0) {
      const user = await prisma.user.findUnique({ where: { id: voterId } });
      const now = new Date();

      // Filter sessions by student range FIRST (mirrors auth.service.ts), so
      // overlapping sessions with different course ranges don't collide.
      const assignedSessions = sessions.filter((s) => {
        if (!s.studentIdStart || !s.studentIdEnd || !user?.studentId) {
          // No range constraints — include the session for everyone
          return true;
        }
        return (
          user.studentId >= s.studentIdStart &&
          user.studentId <= s.studentIdEnd
        );
      });

      if (assignedSessions.length === 0) {
        throw new ForbiddenException(
          'Your student ID is not within the allowed range for any voting session.',
        );
      }

      const activeSession = assignedSessions.find((s) => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        return now >= start && now <= end;
      });

      if (!activeSession) {
        const sortedSessions = assignedSessions.sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        );
        const nextSession = sortedSessions.find(
          (s) => new Date(s.startTime) > now,
        );

        if (nextSession) {
          throw new ForbiddenException(
            `Your voting session is not active yet. It starts on ${new Date(nextSession.startTime).toLocaleString()}.`,
          );
        }

        throw new ForbiddenException('Your voting session has ended.');
      }
    }

    // Rule 1: No double voting
    const existingVote = await prisma.vote.findFirst({
      where: { voterId, electionId },
    });

    if (existingVote) {
      throw new ConflictException(
        'You have already cast a ballot for this election.',
      );
    }

    if (candidateIds.length === 0) {
      throw new BadRequestException(
        'You must vote for at least one candidate.',
      );
    }

    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new BadRequestException('Election not found.');
    }

    let courseSettingsBlock: Record<string, any> = {};
    try {
      courseSettingsBlock =
        typeof election.courseSettings === 'string'
          ? JSON.parse(election.courseSettings)
          : election.courseSettings;
    } catch {
      throw new BadRequestException('Election configuration is malformed.');
    }

    // Rule 2: Segmented Ballot checks based on Candidates' course
    const candidates = await prisma.candidate.findMany({
      where: { id: { in: candidateIds } },
      include: {
        user: {
          include: {
            course: true,
          },
        },
      },
    });

    if (candidates.length !== candidateIds.length) {
      throw new BadRequestException(
        'One or more selected candidates are invalid.',
      );
    }

    const prefixTally: Record<string, number> = {};

    for (const c of candidates) {
      const prefix = c.user?.course?.studentPrefix;
      if (!prefix) {
        throw new BadRequestException(
          'One or more selected candidates have invalid or missing course data.',
        );
      }
      prefixTally[prefix] = (prefixTally[prefix] || 0) + 1;
    }

    for (const [prefix, count] of Object.entries(prefixTally)) {
      const allowedChairs = parseInt(courseSettingsBlock[prefix], 10);
      if (isNaN(allowedChairs)) {
        throw new BadRequestException(
          `Course configuration missing or invalid for category ${prefix}.`,
        );
      }

      if (count > allowedChairs) {
        throw new BadRequestException(
          `You selected too many candidates for the ${prefix} category. Maximum allowed is ${allowedChairs}.`,
        );
      }
    }

    // Execution: Create votes mapping
    const voteData = candidateIds.map((candidateId) => ({
      voterId,
      electionId,
      candidateId,
    }));

    await prisma.vote.createMany({
      data: voteData,
    });

    await this.auditLogsService.logAction(voterId, 'VOTE_CAST', {
      electionId,
      candidateCount: candidateIds.length,
    });

    return { success: true, message: 'Ballot cast successfully.' };
  }
}
