import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { prisma } from '@repo/database';

@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @Roles(
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.MPP_ADVISOR,
    Role.STUDENT,
    Role.CANDIDATE,
  )
  async getCandidates() {
    return this.candidatesService.getCandidates();
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR, Role.SRC_ADVISOR)
  async registerCandidate(
    @Body()
    body: {
      userId: string;
      electionId: string;
      information?: string;
      profilePicture?: string;
      spotlightBanner?: string;
    },
    @Req() req: any,
  ) {
    return this.candidatesService.registerCandidate(
      body.userId,
      body.electionId,
      req.user.id,
      {
        information: body.information,
        profilePicture: body.profilePicture,
        spotlightBanner: body.spotlightBanner,
      },
    );
  }

  @Post(':id/materials')
  @Roles(
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.MPP_ADVISOR,
    Role.CANDIDATE,
    Role.STUDENT,
  )
  async addMaterial(
    @Param('id') candidateId: string,
    @Body()
    body: {
      type: 'manifesto' | 'video' | 'slide' | 'poster';
      title?: string;
      description?: string;
      link?: string;
      manifestos?: { title: string; description: string }[];
    },
    @Req() req: any,
  ) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });
    if (!candidate) throw new NotFoundException('Candidate not found.');

    // Robust ID extraction - check multiple common keys
    const currentUserId = req.user.id || req.user.sub;

    // Allow Admins to bypass. For normal users, their JWT ID MUST match the candidate's 'userId'
    if (req.user.role !== Role.SUPERADMIN && req.user.role !== Role.ADMIN) {
      if (candidate.userId !== currentUserId) {
        console.error(
          `403 Error: Extracted JWT ID (${currentUserId}) != Candidate userId (${candidate.userId}). Full req.user object:`,
          req.user,
        );
        throw new ForbiddenException(
          'Ownership failed: You can only modify your own campaign materials.',
        );
      }
    }
    return this.candidatesService.addMaterial(candidateId, body, req.user.id);
  }

  @Post(':id/qualification')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR, Role.SRC_ADVISOR)
  async upsertQualification(
    @Param('id') candidateId: string,
    @Body() body: { positions: string[]; cgpa: string; justification: string },
    @Req() req: any,
  ) {
    return this.candidatesService.upsertQualification(
      candidateId,
      body.positions,
      body.cgpa,
      body.justification,
      req.user.id,
    );
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR, Role.SRC_ADVISOR, Role.CANDIDATE)
  async updateCandidate(
    @Param('id') candidateId: string,
    @Body()
    body: {
      information?: string;
      profilePicture?: string;
      spotlightBanner?: string;
      status?: string;
    },
    @Req() req: any,
  ) {
    return this.candidatesService.updateCandidate(
      candidateId,
      body,
      req.user.id,
    );
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR, Role.SRC_ADVISOR)
  async deleteCandidate(@Param('id') candidateId: string, @Req() req: any) {
    return this.candidatesService.deleteCandidate(candidateId, req.user.id);
  }

  @Delete(':id/qualification')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MPP_ADVISOR)
  async deleteQualification(@Param('id') candidateId: string, @Req() req: any) {
    return this.candidatesService.deleteQualification(candidateId, req.user.id);
  }

  @Patch(':candidateId/materials/:type/:materialId')
  @Roles(
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.MPP_ADVISOR,
    Role.CANDIDATE,
    Role.STUDENT,
  )
  async updateMaterial(
    @Param('candidateId') candidateId: string,
    @Param('type') type: string,
    @Param('materialId') materialId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });
    if (!candidate) throw new NotFoundException('Candidate not found.');

    // Robust ID extraction - check multiple common keys
    const currentUserId = req.user.id || req.user.sub;

    // Allow Admins to bypass. For normal users, their JWT ID MUST match the candidate's 'userId'
    if (req.user.role !== Role.SUPERADMIN && req.user.role !== Role.ADMIN) {
      if (candidate.userId !== currentUserId) {
        console.error(
          `403 Error: Extracted JWT ID (${currentUserId}) != Candidate userId (${candidate.userId}). Full req.user object:`,
          req.user,
        );
        throw new ForbiddenException(
          'Ownership failed: You can only modify your own campaign materials.',
        );
      }
    }
    return this.candidatesService.updateMaterial(
      candidateId,
      type,
      materialId,
      body,
      req.user.id,
    );
  }

  @Delete(':candidateId/materials/:type/:materialId')
  @Roles(
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.MPP_ADVISOR,
    Role.CANDIDATE,
    Role.STUDENT,
  )
  async deleteMaterial(
    @Param('candidateId') candidateId: string,
    @Param('type') type: string,
    @Param('materialId') materialId: string,
    @Req() req: any,
  ) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });
    if (!candidate) throw new NotFoundException('Candidate not found.');

    // Robust ID extraction - check multiple common keys
    const currentUserId = req.user.id || req.user.sub;

    // Allow Admins to bypass. For normal users, their JWT ID MUST match the candidate's 'userId'
    if (req.user.role !== Role.SUPERADMIN && req.user.role !== Role.ADMIN) {
      if (candidate.userId !== currentUserId) {
        console.error(
          `403 Error: Extracted JWT ID (${currentUserId}) != Candidate userId (${candidate.userId}). Full req.user object:`,
          req.user,
        );
        throw new ForbiddenException(
          'Ownership failed: You can only modify your own campaign materials.',
        );
      }
    }
    return this.candidatesService.deleteMaterial(
      candidateId,
      type,
      materialId,
      req.user.id,
    );
  }

  @Delete(':id/profile-picture')
  @Roles(Role.CANDIDATE, Role.SUPERADMIN, Role.ADMIN)
  async deleteProfilePicture(@Param('id') candidateId: string, @Req() req: any) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });
    if (!candidate) throw new NotFoundException('Candidate not found.');

    const currentUserId = req.user.id || req.user.sub;
    if (
      req.user.role !== Role.SUPERADMIN &&
      req.user.role !== Role.ADMIN &&
      candidate.userId !== currentUserId
    ) {
      throw new ForbiddenException('You can only modify your own profile.');
    }

    if (candidate.profilePicture) {
      const publicId = this.cloudinaryService.extractPublicId(candidate.profilePicture);
      if (publicId) await this.cloudinaryService.deleteImage(publicId);
    }

    await prisma.candidate.update({
      where: { id: candidateId },
      data: { profilePicture: null },
    });

    return { message: 'Profile picture removed' };
  }

  @Delete(':id/spotlight-banner')
  @Roles(Role.CANDIDATE, Role.SUPERADMIN, Role.ADMIN)
  async deleteSpotlightBanner(@Param('id') candidateId: string, @Req() req: any) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });
    if (!candidate) throw new NotFoundException('Candidate not found.');

    const currentUserId = req.user.id || req.user.sub;
    if (
      req.user.role !== Role.SUPERADMIN &&
      req.user.role !== Role.ADMIN &&
      candidate.userId !== currentUserId
    ) {
      throw new ForbiddenException('You can only modify your own banner.');
    }

    if (candidate.spotlightBanner) {
      const publicId = this.cloudinaryService.extractPublicId(candidate.spotlightBanner);
      if (publicId) await this.cloudinaryService.deleteImage(publicId);
    }

    await prisma.candidate.update({
      where: { id: candidateId },
      data: { spotlightBanner: null },
    });

    return { message: 'Spotlight banner removed' };
  }
}
