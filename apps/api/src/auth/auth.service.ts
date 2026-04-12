import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@repo/database';
import * as bcrypt from 'bcrypt';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly auditLogsService: AuditLogsService,
  ) { }

  async studentLogin(studentId: string, icNumber: string) {
    const user = await prisma.user.findUnique({
      where: { studentId },
      include: { course: true },
    });

    if (!user || user.icNumber !== icNumber) {
      throw new UnauthorizedException('Invalid student credentials');
    }

    const lastVote = await prisma.vote.findFirst({
      where: { voterId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (lastVote) {
      throw new ForbiddenException(
        `You have already voted on ${new Date(lastVote.createdAt).toLocaleString()}. Contact SPR if this is an error.`
      );
    }

    const registration = await prisma.voterRegistration.findFirst({
      where: {
        userId: user.id,
        isArchived: false,
        election: { status: 'ACTIVE' },
      },
      include: { election: true },
    });

    if (!registration) {
      throw new ForbiddenException(
        'You are not registered for any active election. Please contact SPR.'
      );
    }

    const election = registration.election;
    const now = new Date();

    let electionDateBlocked = false;
    let electionDateMessage = '';

    if (election.startDate || election.endDate) {
      const startDate = election.startDate ? new Date(election.startDate) : null;
      const endDate = election.endDate ? new Date(election.endDate) : null;

      // Both `now` and startDate/endDate are UTC Date objects — comparison is always correct.
      console.log('[DEBUG][studentLogin] now (UTC):', now.toISOString());
      console.log('[DEBUG][studentLogin] election.startDate (UTC):', startDate?.toISOString());
      console.log('[DEBUG][studentLogin] election.endDate   (UTC):', endDate?.toISOString());

      const toMYT = (d: Date) =>
        d.toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'medium', timeStyle: 'short' });

      if (startDate && now < startDate) {
        electionDateBlocked = true;
        electionDateMessage = `Election has not started yet. It runs from ${toMYT(startDate)} to ${endDate ? toMYT(endDate) : 'TBD'} (MYT).`;
      } else if (endDate && now > endDate) {
        electionDateBlocked = true;
        electionDateMessage = `Election has ended on ${toMYT(endDate)} (MYT).`;
      }
    }

    if (electionDateBlocked) {
      throw new ForbiddenException(electionDateMessage);
    }

    const sessions = await prisma.votingSession.findMany({
      where: { electionId: election.id },
    });

    let session = null;
    let canVote = true;
    let reason = null;
    let hasAssignedSession = false;
    let isWithinSessionTime = false;

    if (sessions.length > 0) {
      const assignedSessions = sessions.filter(s => {
        if (!s.studentIdStart || !s.studentIdEnd || !user.studentId) return false;
        return user.studentId >= s.studentIdStart && user.studentId <= s.studentIdEnd;
      });

      if (assignedSessions.length === 0) {
        canVote = false;
        reason = 'You are not assigned to any voting session. Please contact SPR.';
        hasAssignedSession = false;
      } else {
        hasAssignedSession = true;

        const activeSession = assignedSessions.find(s => {
          const start = new Date(s.startTime);
          const end = new Date(s.endTime);
          return now >= start && now <= end;
        });

        if (activeSession) {
          session = activeSession;
          isWithinSessionTime = true;
          canVote = true;
        } else {
          canVote = false;
          isWithinSessionTime = false;

          const sortedAssigned = assignedSessions.sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          const nextSession = sortedAssigned.find(s => new Date(s.startTime) > now);
          const pastSession = sortedAssigned.filter(s => new Date(s.endTime) < now);

          if (nextSession) {
            const startTime = new Date(nextSession.startTime);
            const timeUntil = startTime.getTime() - now.getTime();
            const hours = Math.floor(timeUntil / (1000 * 60 * 60));
            const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

            let countdownText = '';
            if (hours > 0) {
              countdownText = ` (Starts in ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''})`;
            } else {
              countdownText = ` (Starts in ${minutes} minute${minutes !== 1 ? 's' : ''})`;
            }

            const startTimeMYT = startTime.toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' });
            reason = `Your voting session is not active yet. It starts on ${startTimeMYT} MYT${countdownText}`;
            session = nextSession;
          } else if (pastSession.length === sortedAssigned.length) {
            reason = 'Your voting session has ended.';
            session = sortedAssigned[sortedAssigned.length - 1];
          }
        }
      }
    } else {
      canVote = true;
      hasAssignedSession = false;
      isWithinSessionTime = true;
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        voterId: user.id,
        electionId: election.id,
      },
    });

    if (existingVote) {
      canVote = false;
      reason = 'You have already cast your ballot for this election.';
    }

    let timeUntilStart = null;
    let sessionInfo = null;
    if (session && !isWithinSessionTime && canVote === false) {
      const startTime = new Date(session.startTime);
      const diff = startTime.getTime() - now.getTime();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        timeUntilStart = hours > 0
          ? `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
          : `${minutes} minute${minutes !== 1 ? 's' : ''}`;

        sessionInfo = {
          date: startTime.toLocaleDateString('en-MY'),
          startTime: startTime.toLocaleTimeString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit' }) + ' MYT',
          timeUntilStart: timeUntilStart,
          nextSessionStart: session.startTime,
        };
      }
    }

    if (!canVote) {
      throw new ForbiddenException({
        error: 'SESSION_NOT_ACTIVE',
        message: reason || 'Your session is not active yet.',
        sessionInfo: sessionInfo,
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        studentId: user.studentId,
        role: user.role,
        course: user.course?.studentPrefix || null,
      },
      canVote,
      reason,
      election: {
        id: election.id,
        title: election.title,
        status: election.status,
        startDate: election.startDate,
        endDate: election.endDate,
        courseSettings: election.courseSettings,
      },
      session: session ? {
        id: session.id,
        title: session.title,
        startTime: session.startTime,
        endTime: session.endTime,
        studentIdStart: session.studentIdStart,
        studentIdEnd: session.studentIdEnd,
      } : null,
      hasAssignedSession,
      isWithinSessionTime,
      timeUntilStart,
    };
  }

  async getStudentStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { course: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const registration = await prisma.voterRegistration.findFirst({
      where: {
        userId: user.id,
        isArchived: false,
        election: { status: 'ACTIVE' },
      },
      include: { election: true },
    });

    if (!registration) {
      return {
        canVote: false,
        reason: 'You are not registered for any active election.',
        election: null,
        session: null,
        hasVoted: false,
      };
    }

    const election = registration.election;
    const now = new Date();

    let electionDateBlocked = false;
    let electionDateMessage = '';

    if (election.startDate || election.endDate) {
      const startDate = election.startDate ? new Date(election.startDate) : null;
      const endDate = election.endDate ? new Date(election.endDate) : null;

      // Both `now` and startDate/endDate are UTC Date objects — comparison is always correct.
      console.log('[DEBUG][getStudentStatus] now (UTC):', now.toISOString());
      console.log('[DEBUG][getStudentStatus] election.startDate (UTC):', startDate?.toISOString());
      console.log('[DEBUG][getStudentStatus] election.endDate   (UTC):', endDate?.toISOString());

      const toMYT = (d: Date) =>
        d.toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'medium', timeStyle: 'short' });

      if (startDate && now < startDate) {
        electionDateBlocked = true;
        electionDateMessage = `Election has not started yet. It runs from ${toMYT(startDate)} to ${endDate ? toMYT(endDate) : 'TBD'} (MYT).`;
      } else if (endDate && now > endDate) {
        electionDateBlocked = true;
        electionDateMessage = `Election has ended on ${toMYT(endDate)} (MYT).`;
      }
    }

    if (electionDateBlocked) {
      return {
        canVote: false,
        reason: electionDateMessage,
        election: null,
        session: null,
        hasVoted: false,
      };
    }

    const sessions = await prisma.votingSession.findMany({
      where: { electionId: election.id },
    });

    let session = null;
    let canVote = true;
    let reason = null;
    let hasAssignedSession = false;
    let isWithinSessionTime = false;

    if (sessions.length > 0) {
      const assignedSessions = sessions.filter(s => {
        if (!s.studentIdStart || !s.studentIdEnd || !user.studentId) return false;
        return user.studentId >= s.studentIdStart && user.studentId <= s.studentIdEnd;
      });

      if (assignedSessions.length === 0) {
        canVote = false;
        reason = 'You are not assigned to any voting session. Please contact SPR.';
        hasAssignedSession = false;
      } else {
        hasAssignedSession = true;

        const activeSession = assignedSessions.find(s => {
          const start = new Date(s.startTime);
          const end = new Date(s.endTime);
          return now >= start && now <= end;
        });

        if (activeSession) {
          session = activeSession;
          isWithinSessionTime = true;
          canVote = true;
        } else {
          canVote = false;
          isWithinSessionTime = false;

          const sortedAssigned = assignedSessions.sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          const nextSession = sortedAssigned.find(s => new Date(s.startTime) > now);
          const pastSession = sortedAssigned.filter(s => new Date(s.endTime) < now);

          if (nextSession) {
            const startTime = new Date(nextSession.startTime);
            const timeUntil = startTime.getTime() - now.getTime();
            const hours = Math.floor(timeUntil / (1000 * 60 * 60));
            const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

            let countdownText = '';
            if (hours > 0) {
              countdownText = ` (Starts in ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''})`;
            } else {
              countdownText = ` (Starts in ${minutes} minute${minutes !== 1 ? 's' : ''})`;
            }

            const startTimeMYT = startTime.toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' });
            reason = `Your voting session is not active yet. It starts on ${startTimeMYT} MYT${countdownText}`;
            session = nextSession;
          } else if (pastSession.length === sortedAssigned.length) {
            reason = 'Your voting session has ended.';
            session = sortedAssigned[sortedAssigned.length - 1];
          }
        }
      }
    } else {
      canVote = true;
      hasAssignedSession = false;
      isWithinSessionTime = true;
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        voterId: user.id,
        electionId: election.id,
      },
    });

    if (existingVote) {
      canVote = false;
      reason = 'You have already cast your ballot for this election.';
    }

    let timeUntilStart = null;
    if (session && !isWithinSessionTime && canVote === false) {
      const startTime = new Date(session.startTime);
      const diff = startTime.getTime() - now.getTime();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        timeUntilStart = hours > 0
          ? `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
          : `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }
    }

    return {
      canVote,
      reason,
      election: canVote || reason === 'You have already cast your ballot for this election.' ? {
        id: election.id,
        title: election.title,
        status: election.status,
        startDate: election.startDate,
        endDate: election.endDate,
        courseSettings: election.courseSettings,
      } : null,
      session: session ? {
        id: session.id,
        title: session.title,
        startTime: session.startTime,
        endTime: session.endTime,
      } : null,
      hasVoted: !!existingVote,
      votedAt: existingVote?.createdAt || null,
      hasAssignedSession,
      isWithinSessionTime,
      timeUntilStart,
    };
  }

  async staffLogin(email: string, pass: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.password === 'not-used-for-students') {
      throw new UnauthorizedException('Invalid staff credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid staff credentials');
    }

    if (['STUDENT', 'CANDIDATE'].includes(user.role)) {
      throw new UnauthorizedException('Invalid staff credentials');
    }

    if (user.isTwoFactorAuthenticationEnabled) {
      return { requires2FA: true, email: user.email };
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async impersonateUser(targetUserId: string, superadminId: string) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw new NotFoundException('Target user not found');
    }

    await this.auditLogsService.logAction(superadminId, 'IMPERSONATED_USER', {
      targetUserId,
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}