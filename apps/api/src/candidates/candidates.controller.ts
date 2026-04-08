import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { prisma } from '@repo/database';

@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR, Role.STUDENT, Role.CANDIDATE)
  async getCandidates() {
    return this.candidatesService.getCandidates();
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR)
  async registerCandidate(
    @Body() body: { userId: string; electionId: string; information?: string; profilePicture?: string; spotlightBanner?: string }, 
    @Req() req: any
  ) {
    return this.candidatesService.registerCandidate(body.userId, body.electionId, req.user.id, {
      information: body.information,
      profilePicture: body.profilePicture,
      spotlightBanner: body.spotlightBanner,
    });
  }

  @Post(':id/materials')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR)
  async addMaterial(
    @Param('id') candidateId: string,
    @Body() body: { type: 'manifesto' | 'video' | 'slide' | 'poster'; title?: string; description?: string; link?: string; manifestos?: { title: string; description: string }[] },
    @Req() req: any,
  ) {
    return this.candidatesService.addMaterial(candidateId, body, req.user.id);
  }

  @Post(':id/qualification')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR)
  async upsertQualification(
    @Param('id') candidateId: string,
    @Body() body: { positions: string[]; cgpa: string; justification: string },
    @Req() req: any,
  ) {
    return this.candidatesService.upsertQualification(candidateId, body.positions, body.cgpa, body.justification, req.user.id);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR)
  async updateCandidate(
    @Param('id') candidateId: string,
    @Body() body: { information?: string; profilePicture?: string; spotlightBanner?: string; status?: string },
    @Req() req: any,
  ) {
    return this.candidatesService.updateCandidate(candidateId, body, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR)
  async deleteCandidate(@Param('id') candidateId: string, @Req() req: any) {
    return this.candidatesService.deleteCandidate(candidateId, req.user.id);
  }

  @Delete(':id/qualification')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR)
  async deleteQualification(@Param('id') candidateId: string, @Req() req: any) {
    return this.candidatesService.deleteQualification(candidateId, req.user.id);
  }

  @Patch(':candidateId/materials/:type/:materialId')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR, Role.CANDIDATE)
  async updateMaterial(
    @Param('candidateId') candidateId: string,
    @Param('type') type: string,
    @Param('materialId') materialId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (req.user.role === Role.CANDIDATE) {
      const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
      if (!candidate) throw new NotFoundException('Candidate not found.');
      if (candidate.userId !== req.user.sub) {
        throw new ForbiddenException('You can only modify your own materials.');
      }
    }
    return this.candidatesService.updateMaterial(candidateId, type, materialId, body, req.user.id);
  }

  @Delete(':candidateId/materials/:type/:materialId')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR, Role.CANDIDATE)
  async deleteMaterial(
    @Param('candidateId') candidateId: string,
    @Param('type') type: string,
    @Param('materialId') materialId: string,
    @Req() req: any,
  ) {
    if (req.user.role === Role.CANDIDATE) {
      const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
      if (!candidate) throw new NotFoundException('Candidate not found.');
      if (candidate.userId !== req.user.sub) {
        throw new ForbiddenException('You can only modify your own materials.');
      }
    }
    return this.candidatesService.deleteMaterial(candidateId, type, materialId, req.user.id);
  }
}
