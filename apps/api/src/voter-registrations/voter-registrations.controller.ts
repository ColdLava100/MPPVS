import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { VoterRegistrationsService } from './voter-registrations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

interface ImportVotersDto {
  voters: Array<{
    name: string;
    email: string;
    studentId: string;
    icNumber: string;
    course: string;
  }>;
  electionId: string;
}

@Controller('voter-registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN, Role.SPR_ADVISOR, Role.SPR_VOLUNTEER)
export class VoterRegistrationsController {
  constructor(
    private readonly voterRegistrationsService: VoterRegistrationsService,
  ) {}

  @Get()
  async getRegistrations(@Query('electionId') electionId?: string) {
    return this.voterRegistrationsService.getRegistrations(electionId);
  }

  @Post('import')
  async importVoters(@Body() dto: ImportVotersDto, @Req() req: any) {
    const creatorId = req.user?.id || req.user?.sub;
    return this.voterRegistrationsService.importVoters(
      dto.electionId,
      dto.voters,
      creatorId,
    );
  }

  @Post(':electionId/archive')
  async archiveVoters(@Param('electionId') electionId: string) {
    return this.voterRegistrationsService.archiveVoters(electionId);
  }

  @Post(':electionId/unarchive')
  async unarchiveVoters(@Param('electionId') electionId: string) {
    return this.voterRegistrationsService.unarchiveVoters(electionId);
  }

  @Delete(':id')
  async deleteRegistration(@Param('id') id: string) {
    return this.voterRegistrationsService.deleteRegistration(id);
  }

  @Get('check/:electionId')
  async checkRegistration(
    @Param('electionId') electionId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.voterRegistrationsService.checkUserRegistration(
      userId,
      electionId,
    );
  }
}
