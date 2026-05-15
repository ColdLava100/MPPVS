import { SetMetadata } from '@nestjs/common';

export enum Role {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  MPP_ADVISOR = 'MPP_ADVISOR',
  STUDENT = 'STUDENT',
  CANDIDATE = 'CANDIDATE',
  SPR_ADVISOR = 'SPR_ADVISOR',
  SPR_VOLUNTEER = 'SPR_VOLUNTEER',
  SRC_ADVISOR = 'SRC_ADVISOR',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
