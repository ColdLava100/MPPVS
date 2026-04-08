# MPP Voting System: Security Architecture & Agent Directives

## 1. Core Architecture Constraints
* **Stack:** Turborepo monorepo, `pnpm` package manager. 
* **Frontend:** Next.js (located in `apps/frontend` or similar).
* **Backend:** NestJS (located in `apps/backend` or similar).
* **Database:** PostgreSQL running locally via Docker (`docker-compose.yml`).
* **Deployment:** Strictly On-Premise. 
  * *Agent Directive:* Do not suggest, implement, or use cloud-native services (AWS, Vercel Serverless, Firebase, etc.). All solutions must be runnable on local college hardware.

## 2. Authentication: The 3-Layer Flow
All student/voter access must pass through a strict 3-layer authentication mechanism. No endpoints handling sensitive voter data or ballot casting can bypass this.
1. **Layer 1: Student ID** (Primary identifier lookup)
2. **Layer 2: IC Number** (Secondary identity verification)
3. **Layer 3: 6-Digit Code** (Final authorization token/pin)

*Agent Directive:* When generating NestJS Guards or Passport strategies, ensure all three layers are validated before issuing a session or JWT.

## 3. Authorization & Permissions (RBAC)
The system strictly segregates roles.
* **Students/Voters:** Can only view published candidate data and cast a ballot exactly once. Cannot access draft elections.
* **Admins/Committee:** Can manage elections, toggle Draft/Publish states, and view system metrics.

## 4. Voting Integrity & Anti-Double-Voting
The integrity of the election is the highest priority.
* **Candidate Course Limits:** Validation logic must read the candidate's course/faculty limits and prevent a student from voting across incompatible segments.
* **Strict Single-Vote Enforcement:** The database schema and NestJS services must utilize ACID-compliant transactions to prevent race conditions. A user cannot cast two ballots simultaneously.

## 5. OpenCode Agent Instructions
* Read this file entirely before modifying any code related to `auth`, `users`, `candidates`, or `voting`.
* When writing validation logic, prioritize security over speed.
* Always explicitly state which layer of authentication or authorization you are modifying.