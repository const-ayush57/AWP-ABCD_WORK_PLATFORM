<div align="center">

<br />

```
    ___    ____  ____  ____     _       ______  ____  __ __      ____  _       ___  ______ ____  ___  ____  __  __ 
   /   \  |    ||    ||    \   | |     /      ||    ||  |  |    |    \| |     /   \|      |    ||   \/   ||    \|  ||  |
  |     |  |  |  |  | |  o  )  | |    |      | |  | |  |  |    |  o  ) |    |     |      ||  | |  \_/  ||  _  |  ||  |
  |  A  |  |  |  |  | |   _/  | |___ |      | |  | |  _  |    |   _/| |___ |  O  |_|  |_||  | |  \_/  ||  |  |  ||__|
  |  _  |  |  |  |  | |  |    |     ||  --  | |  | |  |  |    |  |  |     ||     | |  |  |  | |  |  |  ||  |  |  | __ 
  | | | |  |  |  |  | |  |    |     ||      | |  | |  |  |    |  |  |     ||     | |  |  |  | |  |  |  ||  |  |  ||  |
  |_| |_| |____||____||__|    |_____||______||____||__|__|    |__|  |_____| \___/ |__| |____||___/|__|  |__|  |____||__|
```

<br/>

# ABCD Work Platform

**A secure, offline-first POS and workforce management system built for local networks.**
Built with Next.js 16 · React 19 · SQLite · Electron · shadcn/ui

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)](/)
[![Version](https://img.shields.io/badge/Version-1.0.5-success?style=for-the-badge)](/)

<br/>

</div>

---

## 📋 Overview

**ABCD Work Platform (AWP)** is a production-grade desktop application for small businesses that need a fast, reliable POS terminal with full admin oversight — all running **offline on your local network**, with no cloud dependency.

The system is split into two roles:
- **Admin** — manages members, jobs, pricing, and monitors analytics from a centralized dashboard
- **Member (POS Staff)** — uses the billing terminal to process customer orders and generate receipts

All data lives on the **admin's machine**. Members connect over LAN and have billing rights only.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🖥️ Admin Panel
- Full member lifecycle management (create, reset, delete)
- Job template CRUD with category + pricing options
- Real-time analytics: revenue, member share, top jobs
- LAN IP configuration for member discovery
- On-demand security audit log (zero background polling)
- Bootstrap wizard for first-time setup

</td>
<td width="50%">

### 🧾 POS Terminal
- Bento-grid job selector with option toggles
- Smart cart with quantity control and localStorage persistence
- UPI QR code generation for contactless payment
- Cash / UPI payment mode switching
- Itemized digital receipt on checkout
- Stale-cart auto-cleanup (removed templates discarded)

</td>
</tr>
<tr>
<td>

### 🔐 Security
- Network hash binding — admin locked to registered machine
- Single-session enforcement — one device per account
- Admin re-auth before sensitive actions (delete/reset)
- TOTP 2FA for admin accounts
- JWT session token rotation on every login

</td>
<td>

### 🔢 Transaction System
- Structured IDs: `AAAA HH MM SS DD MM YY ORDER#`
- Atomic daily counter — zero collision under concurrent billing
- Full audit trail on every transaction
- Member-scoped authorization enforced server-side

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Route Handlers) |
| UI Library | shadcn/ui + Tremor + Framer Motion |
| Auth | NextAuth.js v4 — Credentials provider + JWT |
| Database | SQLite (via Prisma ORM 5) |
| Forms | React Hook Form + Zod validation |
| Tables | TanStack Table v8 |
| Desktop | Electron (self-contained NSIS installer) |
| Styling | Tailwind CSS v4 |
| Notifications | Sonner toast |
| Email | Nodemailer (SMTP — for admin password recovery) |
| 2FA | otplib (TOTP) + QR code |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/const-ayush57/AWP-ABCD_WORK_PLATFORM.git
cd AWP-ABCD_WORK_PLATFORM

# 2. Install dependencies
npm install

# 3. Set up environment variables
copy .env.example .env
#  → Edit .env and fill in your NEXTAUTH_SECRET and UPI ID

# 4. Initialize the database
npx prisma db push
npx prisma db seed

# 5. Start the development server
npm run dev
```

> **First launch →** Open `http://localhost:3000` and complete the **Admin Bootstrap Wizard** to create your admin account. No default credentials are pre-set.

To access from member devices on the same network, use `http://<your-LAN-ip>:3000`.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="file:./prisma/awp.db"

# NextAuth (generate secret: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
NEXTAUTH_SECRET="<your-strong-secret>"
NEXTAUTH_URL="http://localhost:3000"

# UPI (shown in QR code on POS terminal)
NEXT_PUBLIC_ADMIN_UPI="your-upi-id@bank"

# SMTP — optional, enables admin email recovery
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@example.com
```

> ⚠️ **Never commit your `.env` file.** It is blocked by `.gitignore`.

---

## 📁 Project Structure

```
AWP-ABCD_WORK_PLATFORM/
├── src/
│   ├── app/
│   │   ├── admin/                  # Admin dashboard
│   │   │   ├── jobs/               # Job template management
│   │   │   ├── members/            # Member CRUD + password reset
│   │   │   ├── settings/           # LAN config + audit log viewer
│   │   │   └── admins/             # Admin user accounts
│   │   ├── pos/                    # POS billing terminal (members)
│   │   ├── login/                  # Unified login (Admin / POS Staff tabs)
│   │   └── api/
│   │       ├── transaction/        # Billing + atomic transaction ID
│   │       ├── member/discover/    # LAN server discovery
│   │       └── system/             # Bootstrap, TOTP, audit, recovery
│   ├── components/                 # Shared UI components
│   └── lib/
│       ├── auth.ts                 # NextAuth + network hash binding
│       ├── roles.ts                # RBAC permission system
│       ├── audit.ts                # Audit event logger
│       ├── identity.ts             # Machine fingerprinting
│       ├── totp.ts                 # TOTP 2FA verification
│       ├── email.ts                # SMTP transporter
│       └── recovery.ts             # Admin password recovery
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Initial data seed
├── .env.example                    # Environment variable template
└── README.md
```

---

## 🖥️ Desktop Build (Electron)

To produce a self-contained Windows installer:

```bash
npm run electron:build:win
```

The build pipeline handles everything automatically:
1. Downloads a bundled Node.js runtime
2. Generates Prisma client
3. Pushes schema and seeds the database
4. Builds Next.js in production mode
5. Packages into an NSIS installer

**Output:** `dist/ABCD Work Platform Setup 1.0.5.exe`

End users install once and launch — no Node.js or manual setup required.

---

## 🔒 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                       │
├─────────────────────────────────────────────────────────┤
│  Layer 1 │ Credentials Auth     │ bcrypt password hash  │
│  Layer 2 │ Network Hash Binding │ Admin locked to LAN   │
│  Layer 3 │ Single-Session Token │ One device enforced   │
│  Layer 4 │ RBAC Permissions     │ Role-based routing    │
│  Layer 5 │ TOTP 2FA (optional)  │ Authenticator app     │
│  Layer 6 │ Admin Re-Auth Gate   │ Confirm before delete │
│  Layer 7 │ Audit Trail          │ All actions logged    │
└─────────────────────────────────────────────────────────┘
```

---

## 📸 Screenshots

> *Add screenshots here once the app is deployed or packaged.*

| Admin Dashboard | POS Terminal | Analytics |
|---|---|---|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

---

## 📜 npm Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server on `0.0.0.0:3000` (LAN accessible) |
| `npm run build` | Build Next.js for production |
| `npm run lint` | Run ESLint |
| `npx prisma db push` | Sync Prisma schema to SQLite |
| `npx prisma db seed` | Seed initial data |
| `npm run smtp:test` | Test SMTP configuration |
| `npm run electron:build:win` | Build Windows installer |

---

## 🤝 Contributing

This is a private project. For changes or bug reports, please open an issue or contact the maintainer directly.

---

<div align="center">

Built with ❤️ · Next.js · Prisma · Electron

**[⬆ Back to top](#abcd-work-platform)**

</div>
