import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VotingSessionsService } from './voting-sessions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('voting-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN, Role.ADMIN, Role.SPR_ADVISOR, Role.SPR_VOLUNTEER)
export class VotingSessionsController {
  constructor(private readonly votingSessionsService: VotingSessionsService) {}

  @Get()
  async getVotingSessions() {
    return this.votingSessionsService.getVotingSessions();
  }

  @Post()
  async createVotingSession(@Body() body: any, @Req() req: any) {
    return this.votingSessionsService.create(body, req.user.id);
  }

  @Patch(':id')
  async updateVotingSession(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.votingSessionsService.updateVotingSession(
      id,
      body,
      req.user.id,
    );
  }

  @Delete(':id')
  async deleteVotingSession(@Param('id') id: string, @Req() req: any) {
    return this.votingSessionsService.deleteVotingSession(id, req.user.id);
  }

  @Get(':id/voters')
  async getSessionVoters(@Param('id') id: string) {
    return this.votingSessionsService.getSessionVoters(id);
  }
}
