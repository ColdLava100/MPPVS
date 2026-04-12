import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('elections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}

  @Get()
  @Roles(
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.MPP_ADVISOR,
    Role.STUDENT,
    Role.CANDIDATE,
    Role.SPR_ADVISOR,
    Role.SPR_VOLUNTEER,
  )
  async getElections() {
    return this.electionsService.getElections();
  }

  @Get(':id')
  @Roles(
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.MPP_ADVISOR,
    Role.SPR_ADVISOR,
    Role.SPR_VOLUNTEER,
  )
  async getElectionById(@Param('id') id: string) {
    return this.electionsService.getElectionById(id);
  }

  @Get(':id/voters')
  @Roles(
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.MPP_ADVISOR,
    Role.SPR_ADVISOR,
    Role.SPR_VOLUNTEER,
  )
  async getElectionVoters(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('course') course?: string,
  ) {
    return this.electionsService.getElectionVoters(id, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      search,
      status: (status as any) || 'all',
      course,
    });
  }

  @Get(':id/candidates')
  @Roles(
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.MPP_ADVISOR,
    Role.SPR_ADVISOR,
    Role.SPR_VOLUNTEER,
  )
  async getElectionCandidates(@Param('id') id: string) {
    return this.electionsService.getElectionCandidates(id);
  }

  @Get(':id/sessions')
  @Roles(
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.MPP_ADVISOR,
    Role.SPR_ADVISOR,
    Role.SPR_VOLUNTEER,
  )
  async getElectionSessions(@Param('id') id: string) {
    return this.electionsService.getElectionSessions(id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SPR_ADVISOR, Role.SPR_VOLUNTEER)
  async createElection(@Body() body: any, @Req() req: any) {
    console.log('[DEBUG] Controller received body.startDate:', body.startDate, 'body.endDate:', body.endDate);
    return this.electionsService.create(
      body.title,
      body.courseSettings,
      req.user.id,
      body.startDate,
      body.endDate,
    );
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SPR_ADVISOR, Role.SPR_VOLUNTEER)
  async updateElection(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    console.log('[DEBUG] Controller update received body.startDate:', body.startDate, 'body.endDate:', body.endDate);
    return this.electionsService.updateElection(id, body, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SPR_ADVISOR, Role.SPR_VOLUNTEER)
  async deleteElection(@Param('id') id: string, @Req() req: any) {
    return this.electionsService.deleteElection(id, req.user.id);
  }
}
