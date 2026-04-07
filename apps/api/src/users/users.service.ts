import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { prisma } from '@repo/database';
import * as bcrypt from 'bcrypt';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Role } from '../common/decorators/roles.decorator';

@Injectable()
export class UsersService {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  async getUsers() {
    return prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, studentId: true, icNumber: true, courseId: true, createdAt: true }});
  }

  async createUser(data: any, superAdminId: string) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.studentId ? [{ studentId: data.studentId }] : []),
          ...(data.icNumber ? [{ icNumber: data.icNumber }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException('User with this email, Student ID, or IC Number already exists.');
    }

    let courseId = null;
    if (data.studentId) {
      const match = data.studentId.match(/^[A-Za-z]+/);
      if (match) {
        const code = match[0];
        const course = await prisma.course.findUnique({ where: { code } });
        if (!course) {
          throw new BadRequestException('Invalid course prefix. Course does not exist.');
        }
        courseId = course.id;
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as Role,
        studentId: data.studentId || null,
        icNumber: data.icNumber || null,
        courseId,
      },
    });

    await this.auditLogsService.logAction(superAdminId, 'CREATED_USER', {
      createdUserId: user.id,
      role: user.role,
    });

    const { password: _, ...result } = user;
    return result;
  }

  async updateUser(userId: string, data: any, superAdminId: string) {
    let updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role as Role;
    if (data.icNumber !== undefined) updateData.icNumber = data.icNumber || null;
    
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    if (data.studentId !== undefined) {
      updateData.studentId = data.studentId || null;
      if (data.studentId) {
        const match = data.studentId.match(/^[A-Za-z]+/);
        if (match) {
          const code = match[0];
          const course = await prisma.course.findUnique({ where: { code } });
          if (!course) {
            throw new BadRequestException('Invalid course prefix. Course does not exist.');
          }
          updateData.courseId = course.id;
        } else {
          updateData.courseId = null;
        }
      } else {
        updateData.courseId = null;
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await this.auditLogsService.logAction(superAdminId, 'UPDATED_USER', {
      updatedUserId: user.id,
      changes: Object.keys(updateData),
    });

    const { password: _, ...result } = user;
    return result;
  }

  async deleteUser(userId: string, superAdminId: string) {
    const user = await prisma.user.delete({
      where: { id: userId }
    });

    await this.auditLogsService.logAction(superAdminId, 'DELETED_USER', {
      deletedUserId: user.id,
    });

    return { success: true };
  }
}
