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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('elections')
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}

  @Get('public/metrics')
  @UseGuards()
  async getPublicMetrics() {
    return this.electionsService.getPublicMetrics();
  }

  @Get('public/active-config')
  @UseGuards()
  async getActiveConfig() {
    return this.electionsService.getActiveConfig();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
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
    Role.STUDENT,
  )
  async getElectionCandidates(@Param('id') id: string) {
    console.log('[DEBUG] /elections/:id/candidates called with id:', id);
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SPR_ADVISOR, Role.SPR_VOLUNTEER)
  async createElection(@Body() body: any, @Req() req: any) {
    if (!req.user?.id) {
      throw new HttpException(
        'Unauthorized: User not authenticated',
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.log(
      '[DEBUG] Controller received body.startDate:',
      body.startDate,
      'body.endDate:',
      body.endDate,
    );
    return this.electionsService.create(
      body.title,
      body.courseSettings,
      req.user.id,
      body.startDate,
      body.endDate,
      body.requireSecurityCode,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SPR_ADVISOR, Role.SPR_VOLUNTEER)
  async updateElection(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (!req.user?.id) {
      throw new HttpException(
        'Unauthorized: User not authenticated',
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.log(
      '[DEBUG] Controller update received body.startDate:',
      body.startDate,
      'body.endDate:',
      body.endDate,
    );
    return this.electionsService.updateElection(id, body, req.user.id);
  }

  @Post(':electionId/generate-security-codes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.MPP_ADVISOR,
    Role.SPR_ADVISOR,
    Role.SPR_VOLUNTEER,
  )
  async generateSecurityCodes(
    @Param('electionId') electionId: string,
    @Req() req: any,
  ) {
    const actorId = req.user?.sub || req.user?.id;
    return this.electionsService.generateBulkSecurityCodes(electionId, actorId);
  }

  @Post(':electionId/regenerate-all-security-codes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.MPP_ADVISOR,
    Role.SPR_ADVISOR,
    Role.SPR_VOLUNTEER,
  )
  async regenerateAllSecurityCodes(
    @Param('electionId') electionId: string,
    @Req() req: any,
  ) {
    const actorId = req.user?.sub || req.user?.id;
    return this.electionsService.regenerateAllSecurityCodes(
      electionId,
      actorId,
    );
  }

  @Post(':id/send-bulk-emails')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.MPP_ADVISOR,
    Role.SPR_ADVISOR,
    Role.SPR_VOLUNTEER,
  )
  async sendBulkEmails(@Param('id') id: string, @Req() req: any) {
    const actorId = req.user?.sub || req.user?.id;
    return this.electionsService.sendBulkSecurityCodeEmails(id, actorId);
  }

  @Post(':id/send-selected-emails')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.MPP_ADVISOR,
    Role.SPR_ADVISOR,
    Role.SPR_VOLUNTEER,
  )
  async sendSelectedEmails(
    @Param('id') id: string,
    @Body() body: { userIds: string[] },
    @Req() req: any,
  ) {
    const actorId = req.user?.sub || req.user?.id;
    return this.electionsService.sendSelectedSecurityCodeEmails(
      id,
      actorId,
      body.userIds,
    );
  }

  @Post(':id/regenerate-selected-codes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.MPP_ADVISOR,
    Role.SPR_ADVISOR,
    Role.SPR_VOLUNTEER,
  )
  async regenerateSelectedCodes(
    @Param('id') id: string,
    @Body() body: { userIds: string[] },
    @Req() req: any,
  ) {
    const actorId = req.user?.sub || req.user?.id;
    return this.electionsService.regenerateSelectedSecurityCodes(
      id,
      actorId,
      body.userIds,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SPR_ADVISOR, Role.SPR_VOLUNTEER)
  async deleteElection(@Param('id') id: string, @Req() req: any) {
    if (!req.user?.id) {
      throw new HttpException(
        'Unauthorized: User not authenticated',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.electionsService.deleteElection(id, req.user.id);
  }
}
