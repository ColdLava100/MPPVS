import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/database';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class CandidatesService {
  constructor(private readonly auditLogsService: AuditLogsService) { }

  async getCandidates() {
    return prisma.candidate.findMany({
      include: {
        user: { 
          include: { course: true }
        },
        election: { select: { id: true, title: true } },
        manifestos: true,
        videos: true,
        slides: true,
        posters: true,
        qualification: true,
        _count: { select: { votes: true } },
      },
    });
  }

  async registerCandidate(userId: string, electionId: string, superAdminId: string, optionalFields?: { information?: string; profilePicture?: string; spotlightBanner?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    if (user.role !== 'CANDIDATE') {
      throw new BadRequestException('User must have the CANDIDATE role to be registered as a candidate.');
    }

    const existing = await prisma.candidate.findUnique({ where: { userId } });
    if (existing) throw new BadRequestException('This user is already registered as a candidate.');

    const candidate = await prisma.candidate.create({
      data: { 
        userId, 
        electionId, 
        status: 'PENDING',
        information: optionalFields?.information,
        profilePicture: optionalFields?.profilePicture,
        spotlightBanner: optionalFields?.spotlightBanner,
      },
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
    payload: { type: 'manifesto' | 'video' | 'slide' | 'poster'; title?: string; description?: string; link?: string; manifestos?: { title: string; description: string }[] },
    superAdminId: string,
  ) {
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) throw new NotFoundException('Candidate not found.');
    if (payload.type !== 'manifesto' && !payload.link) throw new BadRequestException('A link is required for this material type.');

    let material: any;

    switch (payload.type) {
      case 'manifesto':
        if (!payload.manifestos || payload.manifestos.length === 0) throw new BadRequestException('Manifesto requires at least one entry.');
        
        // Ensure each manifesto has required fields
        payload.manifestos.forEach(m => {
          if (!m.title || !m.description) throw new BadRequestException('Each manifesto requires a title and description.');
        });
        
        material = await prisma.manifesto.createMany({
          data: payload.manifestos.map(m => ({
            candidateId, title: m.title, description: m.description
          })),
        });
        break;

      case 'video':
        if (!payload.title || !payload.description) throw new BadRequestException('Video requires a title and description.');
        material = await prisma.video.create({
          data: { candidateId, videoTitle: payload.title, videoDescription: payload.description, videoLink: payload.link! },
        });
        break;

      case 'slide':
        if (!payload.title) throw new BadRequestException('Slide requires a title.');
        material = await prisma.slide.create({
          data: { candidateId, slideTitle: payload.title, slideLink: payload.link! },
        });
        break;

      case 'poster':
        material = await prisma.poster.create({
          data: { candidateId, posterLink: payload.link! },
        });
        break;

      default:
        throw new BadRequestException('Invalid material type. Must be manifesto, video, slide, or poster.');
    }

    await this.auditLogsService.logAction(superAdminId, 'ADDED_CANDIDATE_MATERIAL', {
      candidateId,
      type: payload.type,
      materialCount: payload.type === 'manifesto' ? payload.manifestos?.length : 1,
    });

    return material;
  }

  async upsertQualification(candidateId: string, positions: string[], cgpa: string, justification: string, superAdminId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) throw new NotFoundException('Candidate not found.');

    const qualification = await prisma.qualification.upsert({
      where: { candidateId },
      update: { position: positions, cgpa, justification },
      create: { candidateId, position: positions, cgpa, justification },
    });

    await this.auditLogsService.logAction(superAdminId, 'UPSERTED_CANDIDATE_QUALIFICATION', {
      candidateId,
      qualificationId: qualification.id,
    });

    return qualification;
  }

  async updateCandidate(candidateId: string, updates: { information?: string; profilePicture?: string; spotlightBanner?: string; status?: string }, superAdminId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) throw new NotFoundException('Candidate not found.');

    const updated = await prisma.candidate.update({
      where: { id: candidateId },
      data: updates,
    });

    await this.auditLogsService.logAction(superAdminId, 'UPDATED_CANDIDATE', { candidateId, updates });
    return updated;
  }

  async deleteCandidate(candidateId: string, superAdminId: string) {
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) throw new NotFoundException('Candidate not found.');

    await prisma.candidate.delete({ where: { id: candidateId } });
    await this.auditLogsService.logAction(superAdminId, 'DELETED_CANDIDATE', { candidateId });
    return { message: 'Candidate deleted successfully' };
  }

  async deleteQualification(candidateId: string, superAdminId: string) {
    const qual = await prisma.qualification.findUnique({ where: { candidateId } });
    if (!qual) throw new NotFoundException('Qualification not found.');

    await prisma.qualification.delete({ where: { candidateId } });
    await this.auditLogsService.logAction(superAdminId, 'DELETED_QUALIFICATION', { candidateId });
    return { message: 'Qualification deleted successfully' };
  }

  async updateMaterial(candidateId: string, type: string, materialId: string, payload: any, superAdminId: string) {
    let material: any;
    switch (type) {
      case 'manifesto':
        material = await prisma.manifesto.update({ where: { id: materialId }, data: { title: payload.title, description: payload.description } });
        break;
      case 'video':
        material = await prisma.video.update({ where: { id: materialId }, data: { videoTitle: payload.title, videoDescription: payload.description, videoLink: payload.link } });
        break;
      case 'slide':
        material = await prisma.slide.update({ where: { id: materialId }, data: { slideTitle: payload.title, slideLink: payload.link } });
        break;
      case 'poster':
        material = await prisma.poster.update({ where: { id: materialId }, data: { posterLink: payload.link } });
        break;
      default:
        throw new BadRequestException('Invalid material type');
    }
    await this.auditLogsService.logAction(superAdminId, 'UPDATED_MATERIAL', { candidateId, type, materialId });
    return material;
  }

  async deleteMaterial(candidateId: string, type: string, materialId: string, superAdminId: string) {
    switch (type) {
      case 'manifesto':
        await prisma.manifesto.delete({ where: { id: materialId } });
        break;
      case 'video':
        await prisma.video.delete({ where: { id: materialId } });
        break;
      case 'slide':
        await prisma.slide.delete({ where: { id: materialId } });
        break;
      case 'poster':
        await prisma.poster.delete({ where: { id: materialId } });
        break;
      default:
        throw new BadRequestException('Invalid material type');
    }
    await this.auditLogsService.logAction(superAdminId, 'DELETED_MATERIAL', { candidateId, type, materialId });
    return { message: `${type} deleted successfully` };
  }
}
