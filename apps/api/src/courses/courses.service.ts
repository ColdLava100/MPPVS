import { Injectable, ConflictException } from '@nestjs/common';
import { prisma } from '@repo/database';

@Injectable()
export class CoursesService {
  async createCourse(data: { code: string; name: string }) {
    const existing = await prisma.course.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException('Course with this code already exists.');
    }

    return prisma.course.create({
      data: {
        code: data.code,
        name: data.name,
      },
    });
  }

  async getCourses() {
    return prisma.course.findMany();
  }

  async deleteCourse(id: string) {
    return prisma.course.delete({
      where: { id },
    });
  }
}
