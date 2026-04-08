import { Controller, Post, Get, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('elections')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN)
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}

  @Get()
  async getElections() {
    return this.electionsService.getElections();
  }

  @Post()
  async createElection(@Body() body: any, @Req() req: any) {
    return this.electionsService.create(body.title, body.courseSettings, req.user.id);
  }

  @Patch(':id')
  async updateElection(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.electionsService.updateElection(id, body, req.user.id);
  }

  @Delete(':id')
  async deleteElection(@Param('id') id: string, @Req() req: any) {
    return this.electionsService.deleteElection(id, req.user.id);
  }
}
