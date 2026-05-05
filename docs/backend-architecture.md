  # Backend Architecture: KitaBuild Election System

This document outlines the architecture for the backend of the KitaBuild Election System, built using NestJS and Prisma.

## 1. Prisma Schema Design

To avoid multi-table authentication anti-patterns, we consolidate all human actors into a single `User` table. The actor's specific permissions and capabilities are determined by a `Role` ENUM. 

```prisma
enum Role {
  SUPER_ADMIN
  ADMIN
  MPP_ADVISOR
  STUDENT
  CANDIDATE
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  password     String   // Hashed securely (e.g., bcrypt/argon2)
  name         String
  role         Role     @default(STUDENT)
  
  // Specific Identifiers
  icNumber     String?  @unique // Malaysian IC, can be used for secondary verification
  studentId    String?  @unique // Applicable for STUDENT and CANDIDATE
  
  // Security
  securityCode String?  // e.g., for 2FA, password resets, or ballot OTP confirmation
  
  // Audit properties
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Note: Specific role data (like Candidate manifestos) can be moved to related models 
  // e.g., `CandidateProfile` that 1:1 references this User table to keep the auth record clean.
}
```

## 2. NestJS Module Strategy

The NestJS backend will follow a modular monolith architecture. We divide our domains cleanly:

- **`PrismaModule`**: A global module to manage the Prisma Client lifecycle.
- **`AuthModule`**: Handles user authentication. It validates credentials (using `UsersModule`), issues JWT tokens, and defines global or route-specific authentication guards (`JwtAuthGuard`).
- **`UsersModule`**: Responsible for the CRUD operations specifically on the aggregated `User` table.
- **`ElectionsModule`**: Manages the configuration of elections (metadata, start/end dates, valid voter cohorts).
- **`BallotModule` / `VotesModule`**: Manages the voting logic, ensuring idempotency (a student votes only once) and recording selections securely.

## 3. RBAC (Role-Based Access Control) Strategy

To enforce authorization rules, we will implement a custom `RolesGuard` in NestJS alongside a `@Roles()` custom decorator.

### Mechanism:
1. **Authentication First**: `JwtAuthGuard` ensures the user is securely logged in and attaches their decoded JWT payload (which includes their `Role`) to the `req.user` object.
2. **Authorization Second**: `RolesGuard` reads the required roles for a specific route handler using NestJS's `Reflector` and checks if `req.user.role` is authorized.

### Route Protection Examples:
- **Audit Logs & System Settings**: 
  ```typescript
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get('audit-logs')
  ```
- **Managing Elections / Authorizing Candidates**:
  ```typescript
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MPP_ADVISOR)
  @Post('elections')
  ```
- **Casting a Vote**:
  ```typescript
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT, Role.CANDIDATE) // Candidates are active students and can vote
  @Post('votes')
  ```
