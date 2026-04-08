import { Controller, Post, Get, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('elections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR, Role.STUDENT, Role.CANDIDATE)
  async getElections() {
    return this.electionsService.getElections();
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async createElection(@Body() body: any, @Req() req: any) {
    return this.electionsService.create(body.title, body.courseSettings, req.user.id);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async updateElection(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.electionsService.updateElection(id, body, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async deleteElection(@Param('id') id: string, @Req() req: any) {
    return this.electionsService.deleteElection(id, req.user.id);
  }
}
