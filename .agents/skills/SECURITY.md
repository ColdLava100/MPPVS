# MPP Voting System: Security Architecture & Agent Directives

## 1. Core Architecture Constraints
* **Stack:** Turborepo monorepo, `pnpm` package manager. 
* **Frontend:** Next.js (located in `apps/web`).
* **Backend:** NestJS (located in `apps/api`).
* **Database:** PostgreSQL running locally via Docker (`docker-compose.yml`).
* **Deployment:** Strictly On-Premise. 
  * *Agent Directive:* Do not suggest, implement, or use cloud-native services (AWS, Vercel Serverless, Firebase, etc.). All solutions must be runnable on local college hardware.

## 2. Authentication: The 3-Layer Flow (DUAL PATHS)

All student/voter access must pass through a strict 3-layer authentication mechanism. No endpoints handling sensitive voter data or ballot casting can bypass this.

### Path by Role

| Role | Layer 1 | Layer 2 | Layer 3 | Implementation Status |
|------|---------|---------|---------|----------------------|
| **SUPERADMIN** | Email + Password | JWT Token | TOTP 2FA | Implemented, NOT enforced |
| **ADMIN** | Email + Password | JWT Token | TOTP 2FA | Implemented, NOT enforced |
| **STUDENT** | Student ID + IC Number | JWT Token | 6-Digit Ballot Code | NOT implemented |
| **CANDIDATE** | Student ID + IC Number | JWT Token | 6-Digit Ballot Code | NOT implemented |

### Layer Details

**Layer 1: Primary Credentials**
- Admin: `email` + bcrypt hashed `password`
- Student: `studentId` + `icNumber`

**Layer 2: JWT Token**
- 60-minute expiry
- Stored in httpOnly cookie
- Implementation: `apps/api/src/common/guards/jwt.strategy.ts`

**Layer 3A: TOTP 2FA (Admin/SUPERADMIN)**
- Uses `otplib` authenticator
- QR code generation via `qrcode` library
- Implementation: `apps/api/src/two-factor-auth/`
- ⚠️ NOT enforced during login

**Layer 3B: 6-Digit Ballot Code (Student/CANDIDATE)**
- Single-use OTP sent via email
- Verified at ballot submission time
- ⚠️ NOT implemented yet - planned for future

*Agent Directive:* When generating NestJS Guards or Passport strategies, ensure all three layers are validated before issuing a session or JWT. Layer 3 enforcement is pending implementation.

## 3. Authorization & Permissions (RBAC)
The system strictly segregates roles.
* **Students/Voters:** Can only view published candidate data and cast a ballot exactly once. Cannot access draft elections.
* **Admins/Committee:** Can manage elections, toggle Draft/Publish states, and view system metrics.

**Roles Enum:** `apps/api/src/common/decorators/roles.decorator.ts`
```typescript
enum Role {
  SUPERADMIN   // Full system access
  ADMIN        // Election management
  MPP_ADVISOR  // Candidate management
  STUDENT      // Voting
  CANDIDATE    // Can vote, view candidates
}
```

**Guard Implementation:** `apps/api/src/common/guards/roles.guard.ts`

## 4. Voting Integrity & Anti-Double-Voting
The integrity of the election is the highest priority.
* **Candidate Course Limits:** Validation logic must read the candidate's course/faculty limits and prevent a student from voting across incompatible segments.
* **Strict Single-Vote Enforcement:** The database schema and NestJS services must utilize ACID-compliant transactions to prevent race conditions. A user cannot cast two ballots simultaneously.

**Current Checks:**
- Database unique constraint: `@@unique([voterId, electionId, candidateId])` in `schema.prisma:187`
- Service check: `apps/api/src/votes/votes.service.ts:11-17`

**Gaps to Address:**
- No election status validation (votes accepted for DRAFT/COMPLETED)
- No voting session time window enforcement
- No Layer 3 verification before casting vote

## 5. Database Schema (Voting Integrity)

### Core Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `User` | Authentication & identity | `id`, `email`, `password`, `role`, `studentId`, `icNumber`, `courseId` |
| `Election` | Election config | `id`, `title`, `status`, `courseSettings` (JSON) |
| `VotingSession` | Time slots & studentID batching | `id`, `electionId`, `startTime`, `endTime`, `studentIdStart`, `studentIdEnd`, `courseCode` |
| `Candidate` | Candidate profile | `id`, `userId`, `electionId`, `status` |
| `Vote` | Ballot ledger | `voterId`, `candidateId`, `electionId` |
| `AuditLog` | Action tracking | `userId`, `action`, `details` |

### Relationships
```
User (1) ──< Vote
User (1) ──< Candidate
User (1) ──< AuditLog
Election (1) ──< VotingSession
Election (1) ──< Candidate
Election (1) ──< Vote
Candidate (1) ──< Vote
Candidate (1) ──< Qualification
Candidate (1) ──< Manifesto
Candidate (1) ──< Video
Candidate (1) ──< Poster
User (1) ──< Course (via courseId)
```

## 6. OpenCode Agent Instructions
* Read this file entirely before modifying any code related to `auth`, `users`, `candidates`, or `voting`.
* When writing validation logic, prioritize security over speed.
* Always explicitly state which layer of authentication or authorization you are modifying.
* Reference `.agents/SECURITY-GAPS.md` for the prioritized list of security improvements.

---

*Last Updated: April 2026*
*Source of Truth: This file is the authoritative security guide for all agents*
