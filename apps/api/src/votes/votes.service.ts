import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { prisma } from '@repo/database';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class VotesService {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  async submitVote(voterId: string, electionId: string, candidateIds: string[]) {
    // Rule 1: No double voting
    const existingVote = await prisma.vote.findFirst({
      where: { voterId, electionId },
    });

    if (existingVote) {
      throw new ConflictException('You have already cast a ballot for this election.');
    }

    // Rule 2: Max Votes Check
    const voter = await prisma.user.findUnique({
      where: { id: voterId },
    });

    if (!voter || !voter.studentId) {
      throw new BadRequestException('Voter is not a valid student.');
    }

    const prefixMatch = voter.studentId.match(/^[A-Za-z]+/);
    if (!prefixMatch) {
      throw new BadRequestException('Invalid student ID format.');
    }
    const studentPrefix = prefixMatch[0];

    const course = await prisma.course.findUnique({
      where: { studentPrefix },
    });

    if (!course) {
      throw new BadRequestException('Course not found for student prefix.');
    }

    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new BadRequestException('Election not found.');
    }

    // Safely parse JSON
    let maxVotes = 0;
    try {
      const courseSettingsBlock = typeof election.courseSettings === 'string' 
        ? JSON.parse(election.courseSettings) 
        : election.courseSettings;
      
      const courseSettings = (courseSettingsBlock as Record<string, any>)?.[course.code];
      if (!courseSettings) {
        throw new Error('Course settings missing for specific course.');
      }
      maxVotes = parseInt(courseSettings.maxVotes, 10);
      if (isNaN(maxVotes)) { maxVotes = 0; }
    } catch (e) {
      throw new BadRequestException('Failed to determine maximum allowed votes for your course.');
    }

    if (candidateIds.length > maxVotes) {
      throw new BadRequestException(`Exceeded maximum allowed votes. You can select up to ${maxVotes} candidate(s).`);
    }

    if (candidateIds.length === 0) {
      throw new BadRequestException('You must vote for at least one candidate.');
    }

    // Execution: Create votes mapping
    const voteData = candidateIds.map(candidateId => ({
      voterId,
      electionId,
      candidateId,
    }));

    await prisma.vote.createMany({
      data: voteData,
    });

    await this.auditLogsService.logAction(voterId, 'VOTE_CAST', { electionId, candidateCount: candidateIds.length });

    return { success: true, message: 'Ballot cast successfully.' };
  }
}
