import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '@repo/database';
import * as bcrypt from 'bcrypt';

interface VoterImportData {
  name: string;
  email: string;
  studentId: string;
  icNumber: string;
  course: string;
}

@Injectable()
export class VoterRegistrationsService {
  async getRegistrations(electionId?: string) {
    const where = electionId ? { electionId } : {};
    return prisma.voterRegistration.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            icNumber: true,
            isArchived: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });
  }

  async importVoters(
    electionId: string,
    voters: VoterImportData[],
    creatorId: string,
  ) {
    const results = { success: 0, failed: 0, skipped: 0 };
    const errors: string[] = [];
    const duplicates: string[] = [];

    for (const voter of voters) {
      try {
        // 1. Find existing user by ANY of email, studentId, or icNumber
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: voter.email },
              ...(voter.studentId ? [{ studentId: voter.studentId }] : []),
              ...(voter.icNumber ? [{ icNumber: voter.icNumber }] : []),
            ],
          },
        });

        // 2. Check if user exists - track duplicates
        if (user) {
          // Check if user already registered for this election
          const existingRegistration =
            await prisma.voterRegistration.findUnique({
              where: {
                electionId_userId: {
                  electionId,
                  userId: user.id,
                },
              },
            });

          if (existingRegistration) {
            // Already registered - skip silently
            results.skipped++;
            continue;
          }

          // User exists but not registered - offer to link
          // For now, auto-link (existing user gets access to this election)
          // Could be enhanced to prompt user for choice
          duplicates.push(
            `${voter.name} (linked to existing user: ${user.email})`,
          );
        } else {
          // Create new user
          let courseId = null;
          if (voter.studentId) {
            const match = voter.studentId.match(/^[A-Za-z]+/);
            if (match) {
              const prefix = match[0];
              const course = await prisma.course.findUnique({
                where: { studentPrefix: prefix },
              });
              if (course) courseId = course.id;
            }
          }

          const hashedPassword = await bcrypt.hash('password', 10);
          user = await prisma.user.create({
            data: {
              name: voter.name,
              email: voter.email,
              studentId: voter.studentId || null,
              icNumber: voter.icNumber || null,
              password: hashedPassword,
              role: 'STUDENT',
              courseId,
            },
          });
        }

        // 3. Create voter registration for THIS election
        await prisma.voterRegistration.create({
          data: {
            electionId,
            userId: user.id,
          },
        });

        results.success++;
      } catch (err: any) {
        results.failed++;
        errors.push(`${voter.name}: ${err.message}`);
      }
    }

    // If there were duplicates linked, include in response
    if (duplicates.length > 0) {
      errors.push(...duplicates.map((d) => `[Linked] ${d}`));
    }

    return { ...results, errors };
  }

  async archiveVoters(electionId: string) {
    // Get all registrations for this election
    const registrations = await prisma.voterRegistration.findMany({
      where: { electionId, isArchived: false },
      select: { userId: true },
    });

    if (registrations.length === 0) {
      return { message: 'No active voters to archive', count: 0 };
    }

    const userIds = registrations.map((r) => r.userId);

    // Update both VoterRegistrations and Users
    await prisma.$transaction([
      prisma.voterRegistration.updateMany({
        where: { electionId, isArchived: false },
        data: { isArchived: true, archivedAt: new Date() },
      }),
      prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { isArchived: true, archivedAt: new Date() },
      }),
    ]);

    return { message: 'Voters archived successfully', count: userIds.length };
  }

  async unarchiveVoters(electionId: string) {
    const registrations = await prisma.voterRegistration.findMany({
      where: { electionId, isArchived: true },
      select: { userId: true },
    });

    if (registrations.length === 0) {
      return { message: 'No archived voters to unarchive', count: 0 };
    }

    const userIds = registrations.map((r) => r.userId);

    await prisma.$transaction([
      prisma.voterRegistration.updateMany({
        where: { electionId, isArchived: true },
        data: { isArchived: false, archivedAt: null },
      }),
      prisma.user.updateMany({
        where: { id: { in: userIds }, isArchived: true },
        data: { isArchived: false, archivedAt: null },
      }),
    ]);

    return { message: 'Voters unarchived successfully', count: userIds.length };
  }

  async deleteRegistration(registrationId: string) {
    return prisma.voterRegistration.delete({
      where: { id: registrationId },
    });
  }

  async checkUserRegistration(userId: string, electionId: string) {
    const registration = await prisma.voterRegistration.findFirst({
      where: {
        userId,
        electionId,
        isArchived: false,
      },
    });
    return !!registration;
  }
}
