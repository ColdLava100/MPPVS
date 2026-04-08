# Security Gaps - TODO

## HIGH Priority (Current Implementation Gaps)

### 1. 2FA Not Enforced During Login (Admin)
**Impact:** Layer 3 authentication is bypassed - any admin with valid credentials can access system without 2FA
**Current State:** 2FA generation/verification exists in `apps/api/src/two-factor-auth/` but login flow doesn't call it

**Recommended Implementation:**
- Add 2FA verification step after JWT login
- In `apps/api/src/auth/auth.service.ts`:
  1. After successful credential check, query user's `isTwoFactorAuthenticationEnabled` flag
  2. If enabled, return a temporary "2FA required" token instead of full access token
  3. Create new endpoint `POST /auth/2fa/verify` that exchanges temp token + TOTP code for full JWT
- Alternatively: Add `require2FA` field to login DTO and check in auth controller

**Related Files:**
- `apps/api/src/auth/auth.service.ts`
- `apps/api/src/auth/auth.controller.ts`
- `apps/api/src/two-factor-auth/two-factor-auth.service.ts`

---

### 2. Election Status Not Validated Before Voting
**Impact:** Votes can be cast for elections that are DRAFT or COMPLETED
**Current State:** `VotesService.submitVote()` checks election existence but NOT status

**Recommended Implementation:**
- In `apps/api/src/votes/votes.service.ts:23-29`, add status check:
```typescript
if (election.status !== 'ACTIVE') {
  throw new BadRequestException('This election is not currently active.');
}
```
- Also validate before checking existing votes to prevent unnecessary DB queries

**Related Files:**
- `apps/api/src/votes/votes.service.ts`
- `packages/database/prisma/schema.prisma:48`

---

### 3. Voting Session Time Windows Not Enforced
**Impact:** Students can vote outside the assigned time slot
**Current State:** `VotingSession` model has `startTime`, `endTime`, `studentIdStart`, `studentIdEnd` but `submitVote()` doesn't use them

**Recommended Implementation:**
- In `apps/api/src/votes/votes.service.ts`, add before double-vote check:
```typescript
// Find active session for this voter
const now = new Date();
const session = await prisma.votingSession.findFirst({
  where: {
    electionId,
    startTime: { lte: now },
    endTime: { gte: now },
  },
});
if (!session) {
  throw new BadRequestException('No active voting session at this time.');
}
```
- Optional: Check voter.studentId within session.studentIdStart/End range

**Related Files:**
- `apps/api/src/votes/votes.service.ts`
- `packages/database/prisma/schema.prisma:62-76`

---

## MEDIUM Priority

### 4. No Rate Limiting on Auth Endpoints
**Impact:** Brute force attacks possible on `/auth/student/login` and `/auth/staff/login`

**Recommended Implementation:**
- Use `@nestjs/throttler` package
- Install: `pnpm add @nestjs/throttler`
- In `apps/api/src/main.ts`:
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 60000,  // 60 seconds
      limit: 10,   // 10 requests
    }]),
  ],
})
export class AppModule {}
```
- Apply to auth controller methods via `@Throttle()` decorator from `@nestjs/throttler`

**Related Files:**
- `apps/api/src/main.ts`
- `apps/api/src/auth/auth.controller.ts`
- `apps/api/package.json`

---

### 5. StudentID Range Not Validated Against Voting Session
**Impact:** A student could vote in a session not assigned to their studentID batch

**Recommended Implementation:**
- In `apps/api/src/votes/votes.service.ts`, after time window check:
```typescript
const voter = await prisma.user.findUnique({ 
  where: { id: voterId },
  include: { course: true }
});

if (session.studentIdStart && session.studentIdEnd) {
  if (voter.studentId < session.studentIdStart || voter.studentId > session.studentIdEnd) {
    throw new ForbiddenException('Your student ID is not in this session\'s range.');
  }
}
```
- Requires: Import `ForbiddenException` from `@nestjs/common`

**Related Files:**
- `apps/api/src/votes/votes.service.ts`
- `packages/database/prisma/schema.prisma:72-73`

---

## LOW Priority (Future)

### 6. Request Logging for Suspicious Voting Patterns
- Track voting velocity per user
- Flag multiple votes from same IP in short timeframe
- Detect automated voting scripts

### 7. Ballot Encryption at Rest
- Encrypt `Vote` table data
- Use database-level encryption or application-level encryption

### 8. IP-Based Voting Location Tracking
- Log voter IP address in `Vote` record
- Display in admin dashboard for audit

### 9. 6-Digit Ballot Code Implementation (Student/CANDIDATE Layer 3)
**Impact:** No Layer 3 verification for students - they can vote with just credentials + JWT
**Current State:** Not implemented - planned as per security architecture

**Recommended Implementation:**
- Add `ballotCode` field to `User` or generate per-vote OTP
- Implement email-based OTP delivery via existing mail service
- Create endpoint to verify ballot code before accepting vote
- Modify `VotesService.submitVote()` to verify code:
```typescript
// Verify ballot code
const voter = await prisma.user.findUnique({ where: { id: voterId } });
if (voter.ballotCode !== dto.ballotCode) {
  throw new UnauthorizedException('Invalid ballot code');
}
// Invalidate after use
await prisma.user.update({
  where: { id: voterId },
  data: { ballotCode: null }, // Generate new code for future votes
});
```
- Alternatively: Generate unique per-ballot OTP stored in a separate table with expiry

**Related Files:**
- `apps/api/src/votes/votes.service.ts`
- `apps/api/src/mail/mail.service.ts`
- `packages/database/prisma/schema.prisma` (add `ballotCode` field if needed)

---

## Priority Summary

| Priority | Item | Est. Effort |
|----------|------|-------------|
| HIGH | 2FA Enforcement (Admin) | Medium |
| HIGH | Election Status Validation | Low |
| HIGH | Session Time Validation | Low |
| MEDIUM | Rate Limiting | Low |
| MEDIUM | StudentID Range Validation | Low |
| LOW | Request Logging | Medium |
| LOW | Ballot Encryption | High |
| LOW | IP Tracking | Low |
| LOW | 6-Digit Ballot Code (Student) | Medium |

---

*Last Updated: April 2026*
*These gaps should be addressed before production deployment*
