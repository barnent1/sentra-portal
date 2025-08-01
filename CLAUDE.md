# Sentra Portal - Claude Code Context

## Project Overview
Sentra Portal is a web-based orchestration platform that enables developers to create, manage, and access AI-powered software projects from any device. It serves as the central control plane for the Sentra ecosystem, integrating with Claude Code and Sentra CLI.

**Repository**: https://github.com/barnent1/sentra-portal

## Current Status (as of July 31, 2025)
- ✅ Phase 1 Foundation completed (35 tasks)
- ✅ Migrated from Prisma to Drizzle ORM
- ✅ All changes pushed to GitHub

## Tech Stack
- **Framework**: Next.js 14 (App Router) with TypeScript
- **UI**: shadcn/ui with Violet theme (supports all themes)
- **Styling**: TailwindCSS with custom animations
- **Database**: Drizzle ORM (PostgreSQL prod / SQLite dev)
- **Caching**: Redis for sessions and cache
- **Auth**: NextAuth.js v5 with email/password + OAuth (Google, GitHub)
- **State**: Zustand for client state management
- **Real-time**: Socket.io (ready for Phase 2)
- **Deployment**: Docker, supports Fly.io, Railway, self-hosted

## Key Features Implemented
1. **Authentication System**
   - Email/password with bcrypt
   - OAuth providers (Google, GitHub)
   - JWT tokens for API access
   - Session management with Redis
   - Email verification and password reset

2. **API Structure**
   - RESTful endpoints under `/api`
   - Consistent error handling and response format
   - Request validation with Zod
   - Rate limiting with Upstash
   - CORS configuration

3. **UI Components**
   - Professional layout with Header, Footer, Sidebar
   - Theme system with light/dark mode
   - Loading states and skeletons
   - Responsive navigation
   - Mobile-first design

4. **Database Schema**
   - Users (with roles: USER, ADMIN)
   - Projects (with status: ACTIVE, SUSPENDED, ARCHIVED)
   - API Keys (with scopes and rate limits)
   - Audit Logs
   - OAuth accounts and sessions

## Project Structure
```
sentra-portal/
├── app/              # Next.js app router pages and API routes
├── components/       # React components (auth, layout, ui, etc.)
├── db/              # Drizzle schema and migrations
├── lib/             # Utilities, middleware, stores
├── deployment/      # Platform-specific deployment scripts
├── scripts/         # Database and utility scripts
└── docs/            # Documentation
```

## Environment Variables Required
```bash
# Database
DATABASE_URL=            # PostgreSQL for production
REDIS_URL=              # Redis connection string

# Authentication
NEXTAUTH_URL=           # Your app URL
NEXTAUTH_SECRET=        # Generate with: openssl rand -base64 32
JWT_SECRET=             # For API tokens

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Email
EMAIL_FROM=
EMAIL_SERVER=           # SMTP connection string
```

## Quick Start Commands
```bash
# Install dependencies
npm install

# Set up database
npm run db:push        # Create schema
npm run db:seed        # Add test data

# Development
npm run dev            # Start dev server
npm run db:studio      # Open Drizzle Studio

# Production
npm run build
npm run start

# Docker
docker-compose up      # Full stack with PostgreSQL & Redis
```

## Test Credentials (from seed)
- Admin: admin@example.com / password123
- User: user@example.com / password123

## Next Phase (Phase 2 - Core Features)
Priority tasks for Phase 2:
1. Project Management API (PROJ-001 to PROJ-007)
2. Docker Integration (DOCK-001 to DOCK-007)
3. Project UI Components (UI-001 to UI-007)
4. WebSocket Infrastructure (WS-001 to WS-007)

## Key Files to Review
1. `/app/api/README.md` - API documentation
2. `/docs/api-response-standards.md` - API conventions
3. `/lib/auth.ts` - Authentication configuration
4. `/db/schema/` - Database schema definitions
5. `/SENTRA_PORTAL_PRD.md` - Full product requirements
6. `/SENTRA_PORTAL_TASKS.md` - Complete task list

## Architecture Decisions
1. **Drizzle over Prisma**: Better TypeScript support, lighter weight, edge-compatible
2. **App Router**: Latest Next.js patterns for better performance
3. **Violet Theme**: Professional default with theme switching support
4. **Redis Sessions**: Scalable session management across devices
5. **Docker First**: Easy deployment across platforms

## Known Configuration
- GitHub Token: [Redacted - generate new token when needed]
- Repository: https://github.com/barnent1/sentra-portal
- Main branch: main

## Deployment Options
1. **Fly.io**: `cd deployment/fly && ./deploy.sh`
2. **Railway**: `cd deployment/railway && ./deploy.sh`
3. **Self-hosted**: `cd deployment/self-hosted && ./deploy.sh`
4. **NPX** (future): `npx @sentra/portal deploy`

## Important Notes
- All Phase 1 foundation tasks completed by 5 parallel AI agents
- Database ORM migrated from Prisma to Drizzle (breaking change)
- Authentication fully functional with NextAuth + Drizzle adapter
- UI uses shadcn/ui components with custom theme system
- Docker setup includes development and production configurations

## Contact
- Created by: Barnhardt Enterprises
- Related repos: 
  - https://github.com/barnent1/sentra-cli
  - https://github.com/barnent1/sentra

---
Last updated: July 31, 2025