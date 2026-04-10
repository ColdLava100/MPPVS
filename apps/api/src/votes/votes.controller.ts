import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { SubmitVoteDto } from './dto/submit-vote.dto';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT, Role.CANDIDATE, Role.SUPERADMIN)
  async submitVote(@Req() req: any, @Body() dto: SubmitVoteDto) {
    let voterId = req.user?.sub || req.user?.id;

    if (req.user?.role === Role.SUPERADMIN && dto.simulatedVoterId) {
      voterId = dto.simulatedVoterId;
    }

    return this.votesService.submitVote(
      voterId,
      dto.electionId,
      dto.candidateIds,
    );
  }
}
