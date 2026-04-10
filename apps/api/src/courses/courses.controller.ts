import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  Get,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

export class CreateCourseDto {
  code!: string;
  studentPrefix!: string;
  name!: string;
  enrollmentDate?: string;
}

export class UpdateCourseDto {
  code?: string;
  studentPrefix?: string;
  name?: string;
  enrollmentDate?: string;
}

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SPR_ADVISOR, Role.SPR_VOLUNTEER)
  async createCourse(@Body() dto: CreateCourseDto) {
    if (!dto.code || !dto.studentPrefix || !dto.name) {
      throw new BadRequestException(
        'Code, student prefix, and name are required fields.',
      );
    }
    return this.coursesService.createCourse(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SPR_ADVISOR, Role.SPR_VOLUNTEER)
  async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.updateCourse(id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SPR_ADVISOR, Role.SPR_VOLUNTEER)
  async getCourses() {
    return this.coursesService.getCourses();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SPR_ADVISOR, Role.SPR_VOLUNTEER)
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }
}
