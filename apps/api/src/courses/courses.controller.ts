import { Controller, Post, Body, UseGuards, BadRequestException, Get, Delete, Param } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

export class CreateCourseDto {
  code!: string;
  name!: string;
}

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  async createCourse(@Body() dto: CreateCourseDto) {
    if (!dto.code || !dto.name) {
      throw new BadRequestException('Code and name are required fields.');
    }
    return this.coursesService.createCourse(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  async getCourses() {
    return this.coursesService.getCourses();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }
}
