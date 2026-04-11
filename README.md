# ABCD Work Platform (AWP)

A desktop-first POS and workforce management application built with **Next.js + Electron**, designed for local-network (LAN) usage with strict role separation between Admin and Member accounts.

---

## Core Stack

| Layer | Technology |
|---|---|
| Frontend & Backend | Next.js 16 App Router (Server Components + Route Handlers) |
| Desktop Shell | Electron |
| Authentication | NextAuth.js — Credentials provider + JWT sessions |
| Database | SQLite via Prisma ORM |
| Styling / UI | Tailwind CSS + shadcn/ui + Tremor |
| Animations | Framer Motion |

---

## Features

- **Admin Dashboard** — member management, job template CRUD, analytics (revenue, member share, job popularity)
- **POS Terminal** — bento-grid job selection, cart with quantity control, UPI QR / Cash payment, itemized print receipts
- **Structured Transaction IDs** — `NAME4 + HHMMSS + DDMMYY + ORDER` with atomic daily order counter
- **Single-Session Enforcement** — one login per account across the LAN
- **Network Hash Binding** — admin login locked to the registered machine
- **TOTP 2FA** — optional authenticator app for admin accounts
- **Audit Log Viewer** — all admin actions, logins, and member events (on-demand in Settings)
- **Secure Admin Actions** — password reset / member delete require admin password re-authentication
- **LAN Discovery** — members connect from any device on the same network

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/const-ayush57/AWP-ABCD_WORK_PLATFORM.git
cd AWP-ABCD_WORK_PLATFORM
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
copy .env.example .env
```

Generate a secure `NEXTAUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Set up the database

```bash
npx prisma db push
npx prisma db seed
```

> **First-run setup**: On first launch, navigate to `http://localhost:3000` — the app will guide you through bootstrapping the first admin account via a secure setup wizard. No default credentials are hardcoded.

### 4. Run in development mode

```bash
npm run dev
```

App will be available at `http://localhost:3000` (and on your LAN at `http://<your-ip>:3000`).

---

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin dashboard pages and actions
│   │   ├── jobs/       # Job template management
│   │   ├── members/    # Member CRUD
│   │   ├── settings/   # LAN config + audit log viewer
│   │   └── admins/     # Admin user management
│   ├── pos/            # POS terminal (member billing)
│   ├── api/
│   │   ├── transaction/        # Billing endpoint
│   │   ├── member/discover/    # LAN server discovery
│   │   └── system/             # Auth, bootstrap, TOTP, audit
│   └── login/          # Unified login page (Admin / POS Staff tabs)
├── lib/
│   ├── auth.ts         # NextAuth config + network hash check
│   ├── roles.ts        # RBAC permission system
│   ├── audit.ts        # Audit log helper
│   ├── identity.ts     # Machine fingerprinting
│   └── totp.ts         # TOTP verification
prisma/
├── schema.prisma       # Data models
└── seed.ts             # Initial DB seed
```

---

## Environment Variables

See `.env.example` for the full list. Required variables:

```env
DATABASE_URL="file:./prisma/awp.db"
NEXTAUTH_SECRET="<generate a strong random secret>"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_ADMIN_UPI="your-upi-id@bank"
```

Optional (for email-based admin password recovery):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@example.com
```

> ⚠️ **Never commit your `.env` file.** It is excluded by `.gitignore`.

---

## Production Build (Electron Installer)

```bash
npm run electron:build:win
```

Outputs a self-contained Windows installer at `dist/ABCD Work Platform Setup <version>.exe`.

The build pipeline automatically:
- Downloads a bundled Node.js runtime
- Generates Prisma client
- Pushes schema and seeds the database
- Builds Next.js in production mode
- Packages everything into an NSIS installer

---

## Security Notes

- **No default credentials** — the first admin account is created through a bootstrapped first-launch setup wizard
- **Network hash binding** — admin logins are only accepted from the machine that originally bootstrapped the system
- **Single-session tokens** — logging in from a second device immediately invalidates the first session
- **Audit trail** — all sensitive actions (logins, member ops, password resets) are logged

---

## Suggested Release Workflow

1. Pull latest source
2. Run `npm install`
3. Run `npm run electron:build:win`
4. Share the generated `.exe` from `dist/` with the end user
5. End user installs and launches — no manual Node.js installation required
