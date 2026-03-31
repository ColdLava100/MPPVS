---
name: NestJS API Rules
description: Exact rules for generating backend code in the NestJS API application.
---

# NestJS API Guidelines

When working on the backend codebase (within `/apps/api`), you must deeply integrate the following architectural principles:

1. **Role-Based Access Control (RBAC)**:
   - Always enforce authorization on restricted endpoints utilizing the custom `RolesGuard`.
   - Apply the `@Roles()` decorator directly adjacent to your route handlers, specifically requesting the necessary string permutations locally (e.g., `@Roles(Role.SUPER_ADMIN)`).
   - Authenticate users utilizing robust JWT payloads that embed the user's role securely.

2. **Database Integration**:
   - You must cleanly inject the `PrismaService` directly into your services via the class constructor. Do not instantiate isolated runtime instances of the PrismaClient.
   - All complex database fetching algorithms remain exclusively localized to the specific Service file.

3. **Logical NestJS Modularity**:
   - Every cohesive feature must be siloed cleanly into Modules, Controllers, and Services. Ensure correct export/import arrays inside Module definitions so dependency injection never crashes.
