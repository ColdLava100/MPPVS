import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

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
    @Body() body: { type: 'manifesto' | 'video' | 'slide' | 'poster'; title?: string; description?: string; link: string },
    @Req() req: any,
  ) {
    return this.candidatesService.addMaterial(candidateId, body, req.user.id);
  }

  @Post(':id/qualification')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR)
  async upsertQualification(
    @Param('id') candidateId: string,
    @Body() body: { position: string; cgpa: string; justification: string },
    @Req() req: any,
  ) {
    return this.candidatesService.upsertQualification(candidateId, body.position, body.cgpa, body.justification, req.user.id);
  }
}
