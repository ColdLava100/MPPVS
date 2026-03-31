---
name: Prisma Database Rules
description: Rules for modifying the database schema and executing migrations.
---

# Prisma Database Guidelines

When modifying the fundamental database layer (within `/packages/database/prisma`), strict caution must be applied:

1. **Schema Design Restrictions**:
   - Always preserve the unified mapping of the single-table `User` entity augmented by the generic `Role` Enum parameter. We systematically avoid fracturing into disjoint role-based silos to ensure authentication pipelines remain globally optimized.

2. **Migration Operations**:
   - **CRITICAL RULE**: Do **NOT** utilize `npx prisma db push` under any circumstances moving forward as it forcefully overrides structure destructively and prevents audit tracking.
   - You must strictly generate standard, sequential deployment steps exclusively via: 
     `npx prisma migrate dev --name <highly_descriptive_name>`
   - This ensures that a perfect historical timeline of sequential `.sql` migration instructions successfully populates inside `/packages/database/prisma/migrations` for collaborative version control accuracy.
