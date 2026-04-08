import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/database';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class CandidatesService {
  constructor(private readonly auditLogsService: AuditLogsService) { }

  async getCandidates() {
    return prisma.candidate.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, studentId: true, courseId: true } },
        election: { select: { id: true, title: true } },
        manifestos: true,
        videos: true,
        slides: true,
        posters: true,
      },
    });
  }

  async registerCandidate(userId: string, electionId: string, superAdminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    if (user.role !== 'CANDIDATE') {
      throw new BadRequestException('User must have the CANDIDATE role to be registered as a candidate.');
    }

    const existing = await prisma.candidate.findUnique({ where: { userId } });
    if (existing) throw new BadRequestException('This user is already registered as a candidate.');

    const candidate = await prisma.candidate.create({
      data: { userId, electionId, status: 'PENDING' },
    });

    await this.auditLogsService.logAction(superAdminId, 'REGISTERED_CANDIDATE', {
      candidateId: candidate.id,
      userId,
      electionId,
    });

    return candidate;
  }

  async addMaterial(
    candidateId: string,
    payload: { type: 'manifesto' | 'video' | 'slide' | 'poster'; title?: string; description?: string; link: string },
    superAdminId: string,
  ) {
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) throw new NotFoundException('Candidate not found.');
    if (!payload.link) throw new BadRequestException('A link is required for all material types.');

    let material: any;

    switch (payload.type) {
      case 'manifesto':
        if (!payload.title || !payload.description) throw new BadRequestException('Manifesto requires a title and description.');
        material = await prisma.manifesto.create({
          data: { candidateId, manifestoTitle: payload.title, manifestoDesc: payload.description, manifestoLink: payload.link },
        });
        break;

      case 'video':
        if (!payload.title || !payload.description) throw new BadRequestException('Video requires a title and description.');
        material = await prisma.video.create({
          data: { candidateId, videoTitle: payload.title, videoDescription: payload.description, videoLink: payload.link },
        });
        break;

      case 'slide':
        if (!payload.title) throw new BadRequestException('Slide requires a title.');
        material = await prisma.slide.create({
          data: { candidateId, slideTitle: payload.title, slideLink: payload.link },
        });
        break;

      case 'poster':
        material = await prisma.poster.create({
          data: { candidateId, posterLink: payload.link },
        });
        break;

      default:
        throw new BadRequestException('Invalid material type. Must be manifesto, video, slide, or poster.');
    }

    await this.auditLogsService.logAction(superAdminId, 'ADDED_CANDIDATE_MATERIAL', {
      candidateId,
      type: payload.type,
      materialId: material.id,
    });

    return material;
  }
}
