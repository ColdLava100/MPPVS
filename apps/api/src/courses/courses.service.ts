import { Injectable, ConflictException } from '@nestjs/common';
import { prisma } from '@repo/database';

@Injectable()
export class CoursesService {
  async createCourse(data: {
    code: string;
    studentPrefix: string;
    name: string;
    enrollmentDate?: string;
  }) {
    const existing = await prisma.course.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException('Course with this code already exists.');
    }

    return prisma.course.create({
      data: {
        code: data.code,
        studentPrefix: data.studentPrefix,
        name: data.name,
        enrollmentDate: data.enrollmentDate,
      },
    });
  }

  async updateCourse(
    id: string,
    data: {
      code?: string;
      studentPrefix?: string;
      name?: string;
      enrollmentDate?: string;
    },
  ) {
    return prisma.course.update({
      where: { id },
      data: {
        code: data.code,
        studentPrefix: data.studentPrefix,
        name: data.name,
        enrollmentDate: data.enrollmentDate,
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
