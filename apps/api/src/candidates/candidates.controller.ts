import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN)
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  async getCandidates() {
    return this.candidatesService.getCandidates();
  }

  @Post()
  async registerCandidate(@Body() body: { userId: string; electionId: string }, @Req() req: any) {
    return this.candidatesService.registerCandidate(body.userId, body.electionId, req.user.id);
  }

  @Post(':id/materials')
  async addMaterial(
    @Param('id') candidateId: string,
    @Body() body: { type: 'manifesto' | 'video' | 'slide' | 'poster'; title?: string; description?: string; link: string },
    @Req() req: any,
  ) {
    return this.candidatesService.addMaterial(candidateId, body, req.user.id);
  }
}
