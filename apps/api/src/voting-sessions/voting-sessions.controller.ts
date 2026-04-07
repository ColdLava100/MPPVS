import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { VotingSessionsService } from './voting-sessions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('voting-sessions')
export class VotingSessionsController {
  constructor(private readonly votingSessionsService: VotingSessionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  async createVotingSession(@Body() body: any, @Req() req: any) {
    return this.votingSessionsService.create(body, req.user.id);
  }
}
