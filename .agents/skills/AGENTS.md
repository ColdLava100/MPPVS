# MPPVS Project Context

## Architecture
- **Monorepo**: Turborepo with pnpm (NOT npm or yarn)
- **Root package**: `turborepo-template`

## Apps
- **apps/api**: NestJS backend (port 3001)
- **apps/web**: Next.js frontend (port 3000)

## Packages
- **packages/database**: Prisma database schema and client
- **packages/ui**: Shared UI components

## Build Commands
```bash
pnpm build        # Build all apps
pnpm dev:web     # Start web dev server
pnpm dev:api     # Start api dev server
pnpm dev:all     # Start all dev servers
pnpm lint        # Lint all apps
pnpm test        # Run tests
```

## Tech Stack
- API: NestJS, JWT auth, Passport, 2FA, bcrypt
- Web: Next.js 16, React 19, TailwindCSS 4
- Database: Prisma
- Testing: Playwright, Jest
