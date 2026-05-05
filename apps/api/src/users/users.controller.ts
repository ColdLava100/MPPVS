import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

export class CreateUserDto {
  email!: string;
  password?: string;
  name!: string;
  role!: Role;
  icNumber?: string;
  studentId?: string;
  coursePrefix?: string;
}

export class UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  role?: Role;
  icNumber?: string;
  studentId?: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN, Role.SPR_ADVISOR, Role.SPR_VOLUNTEER)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Query('role') role?: string) {
    return this.usersService.getUsers(role);
  }

  @Post()
  async createUser(@Body() dto: CreateUserDto, @Req() req: any) {
    if (!dto.email || !dto.name || !dto.role) {
      throw new BadRequestException(
        'Email, name, and role are required fields.',
      );
    }
    const adminId = req.user?.id || req.user?.sub;
    return this.usersService.createUser(dto, adminId);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: any,
  ) {
    const adminId = req.user?.id || req.user?.sub;
    return this.usersService.updateUser(id, dto, adminId);
  }

  @Post(':id/security-code')
  async generateSecurityCode(@Param('id') id: string, @Req() req: any) {
    const actorId = req.user?.sub || req.user?.id;
    return this.usersService.generateSecurityCode(id, actorId);
  }

  @Post(':id/send-email')
  async sendSecurityCodeEmail(@Param('id') id: string, @Req() req: any) {
    const actorId = req.user?.sub || req.user?.id;
    return this.usersService.sendSecurityCodeEmail(id, actorId);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    return this.usersService.deleteUser(id, req.user.id);
  }
}
