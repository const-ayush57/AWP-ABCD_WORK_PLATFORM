# ABCD Work Platform

ABCD Work Platform is a desktop-first POS and workforce management application built with Next.js + Electron. It is designed for local-network usage and role-separated operation (ADMIN and MEMBER).

## Core Stack

- Frontend and backend: Next.js App Router (server components + route handlers)
- Desktop shell: Electron
- Auth: NextAuth credentials provider
- Database: SQLite via Prisma
- Styling/UI: Tailwind CSS + shadcn/ui + Tremor

## Functional Overview

- Login-based role access
- Admin dashboard for jobs, members, and analytics
- POS dashboard for member operations
- Transaction recording and reporting
- UPI QR flow support via environment configuration

## Important Project Paths

- App routes: src/app
- API routes: src/app/api
- Auth config: src/lib/auth.ts
- Access middleware: src/middleware.ts
- Prisma schema and seed: prisma/schema.prisma, prisma/seed.ts
- Electron process: electron/main.js
- Build preparation scripts: scripts/download-node.js, scripts/prepare-electron.js
- Packaging config: electron-builder.yml

## Environment Configuration

Use .env for local development and .env.production for packaged app defaults.

Required variables:

```env
DATABASE_URL="file:./prisma/awp.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace_with_secure_secret"
NEXT_PUBLIC_ADMIN_UPI="your-upi-id@bank"
```

## Database Notes

- Prisma datasource is SQLite (not MongoDB).
- Database file used by the app is awp.db.
- Build pipeline now creates/syncs schema and seeds before packaging.

Seeded default admin user:

- Username: admin
- Password: admin123

Change this password immediately in production deployments.

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client and sync DB:

```bash
npm run prisma:generate
npm run prisma:push
```

3. Seed initial data:

```bash
npm run prisma:seed
```

4. Run app in development mode:

```bash
npm run electron:dev
```

## Production Build and Installer

The packaging flow is designed so end users only install and launch the app.

Build Windows installer:

```bash
npm run electron:build:win
```

This automatically performs:

- Bundled Node runtime download
- Prisma client generation
- Prisma DB push
- Prisma seed
- Next.js production build
- Electron artifact preparation
- NSIS installer creation

Output setup file:

- dist/ABCD Work Platform Setup 1.0.5.exe

## Runtime Packaging Guarantees

prepare-electron now fails fast if mandatory artifacts are missing, including:

- .next/standalone output
- prisma/awp.db
- node_modules/.prisma/client
- node_modules/@prisma/client
- node_modules/@prisma/engines

This prevents shipping broken installers.

## Troubleshooting Startup Error

If startup shows server exit code 1, most likely cause is a broken/old installer missing runtime artifacts. Rebuild and reinstall using the latest setup executable from dist.

## Scan Report: Unnecessary Files and Folders

Current workspace scan indicates these are generated artifacts and can be removed safely for cleanup (they will be recreated as needed):

- .next (Next.js build cache/output)
- dist (Electron packaging output)
- node-runtime (downloaded bundled Node binary)
- node_modules (installed dependencies)

Observed approximate sizes:

- .next: ~1729.71 MB
- dist: ~997.5 MB
- node-runtime: ~81.18 MB
- node_modules: ~1676.64 MB

Optional cleanup command (PowerShell):

```powershell
Remove-Item -Recurse -Force .next, dist, node-runtime, node_modules
```

Do not remove these source folders/files:

- src
- prisma/schema.prisma
- prisma/seed.ts
- electron
- scripts
- package.json
- electron-builder.yml

## Suggested Release Flow

1. Pull latest source.
2. Run npm install.
3. Run npm run electron:build:win.
4. Share only the generated setup file from dist.
5. End user installs and launches app (no manual Node installation required).
