import { SetMetadata } from '@nestjs/common';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MPP_ADVISOR = 'MPP_ADVISOR',
  STUDENT = 'STUDENT',
  CANDIDATE = 'CANDIDATE',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
