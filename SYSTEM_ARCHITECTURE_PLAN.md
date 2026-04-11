# ABCD Work Platform — System Architecture & Deployment Plan

> **Document Purpose:** Full architectural reference based on design decisions made during April 2026 development sessions.
> **Last Updated:** April 11, 2026
> **Status:** Phase 1 (Web/Local) — Complete. Phase 2 (Packaging) — Planned.

---

## 1. What This System Is

The **ABCD Work Platform (AWP)** is a **LAN-based Point-of-Sale and Operations Management system** built for small businesses with multiple billing counters. It is designed to run on a private office network — no internet required, no cloud dependency, no external servers.

### Core Concept

- **One machine** (Admin) hosts the entire system — server, database, and control panel.
- **All other machines** (Members/Staff) connect to it through a browser or app over the local network.
- Every rupee collected, every job done, every login attempt — everything is recorded on the admin's machine only.

---

## 2. Current Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend & Backend | Next.js 16 (App Router, Turbopack) | Single unified web application |
| Database | SQLite via Prisma ORM | File-based, zero-config, local only |
| Authentication | NextAuth.js (JWT, Credentials) | Role-based session management |
| UI Components | Shadcn/ui + Tailwind CSS 4 | Admin dashboard and POS interface |
| Charts | Tremor | Analytics and revenue charts |
| Security | bcrypt + TOTP + MAC-hash lock | Multi-layer admin protection |
| Runtime | Node.js (Next.js server) | Serves all requests on LAN |

---

## 3. Data Storage — Complete Picture

### Storage Technology: SQLite

The entire database is a **single file** on the admin machine:

```
[Admin Machine]
C:\ProgramData\ABCD Work Platform\
    data\
        awp.db                  ← The entire database (single file)
    auth\
        network-identity.json   ← Admin MAC hash (for login lock)
        device-identity.json    ← Admin device identity
```

**In development**, `awp.db` lives at `prisma/awp.db` in the project folder.
**In production** (packaged .exe), it moves to `%PROGRAMDATA%\ABCD Work Platform\data\awp.db`. This path is already coded in `src/lib/identity.ts`.

### What Is Stored in `awp.db`

| Table | Data Stored |
|---|---|
| `User` | All accounts (admins + members) — username, hashed password, role, online status, last seen |
| `Transaction` | Every billing record — member who did it, job, amount, payment method, receipt number, timestamp |
| `JobTemplate` | All job types defined by admin (e.g. Xerox, Binding) with prices |
| `JobOption` | Add-on modifiers for jobs (e.g. Color Printing +₹5) |
| `NetworkAuthority` | Admin machine's MAC-based network hash — ties admin login to one physical machine |
| `ServerConfig` | Admin machine's LAN IP and port — used for member discovery |
| `AuditLog` | Full security event log — every login, failure, admin action, analytics access |
| `AdminTOTPConfig` | 2FA secret for admin (optional, if enabled) |
| `AdminRecoveryToken` | Temporary OTP tokens for email-based password recovery |
| `AdminCreationRequest` | Multi-admin creation approval workflow records |

### What Member Machines Store

**Nothing.** Zero. Member machines have no database, no files, no local cache of any transaction. When a member submits a billing transaction:

```
Member Machine (Browser/App)
    │
    │  POST /api/pos/checkout  (over LAN)
    ▼
Admin Machine (Next.js Server)
    │
    │  Validates session, writes to awp.db
    │
    ▼
    Returns receipt data
    │
    ▼
Member Machine displays receipt
(nothing saved locally)
```

---

## 4. Current System State — What Works

### Fully Functional (Tested April 11, 2026)

| Feature | Status |
|---|---|
| First-run admin bootstrap (self-registration) | ✅ Working |
| Admin login with network hash verification | ✅ Working |
| Admin login blocked from wrong machines (MAC lock) | ✅ Working |
| Role-based access control (ADMIN / MEMBER) | ✅ Working |
| Job template creation and management | ✅ Working |
| Member account creation by admin | ✅ Working |
| Member POS login (separate tab, separate flow) | ✅ Working |
| POS billing — job selection, UPI / Cash payment | ✅ Working |
| Receipt generation with transaction reference | ✅ Working |
| Transaction saved to DB (confirmed via DB inspection) | ✅ Working |
| Admin dashboard — Mission Control overview | ✅ Working |
| Today's Revenue and Today's Jobs stats | ✅ Fixed (timezone bug resolved) |
| Top Performer analytics | ✅ Working |
| Full Analytics Dashboard (charts, filters, member breakdown) | ✅ Working |
| Audit log recording (login, member create, analytics access) | ✅ Working |
| Online/offline status of members in real-time | ✅ Working |
| Single-session enforcement (one device per member) | ✅ Working |
| Admin TOTP (2FA) support | ✅ Working |
| Email OTP recovery for admin password | ✅ Working (requires SMTP config) |
| Member discovery backend API | ✅ Working (no UI yet) |
| Multi-admin support with approval workflow | ✅ Working |

### Known Gaps (Web Phase)

| Gap | Impact | When to Fix |
|---|---|---|
| No "Connect to Server" UI for members on wrong IP | Members can't find server if IP changes | At .exe packaging phase |
| SMTP not configured for email recovery | Recovery email will not send without setup | Before production handover |
| No TOTP setup UI | Admin cannot enable 2FA from dashboard | Before production handover |

---

## 5. Multi-Machine LAN Architecture

### How the Network Is Structured

```
                    OFFICE LAN (192.168.1.x)
                           │
          ┌────────────────┴────────────────┐
          │                                 │
    ADMIN MACHINE                    MEMBER MACHINES
    192.168.1.34:3000                (any number)
    ──────────────                   ────────────
    Runs Next.js server             Browser or thin client
    Has awp.db (all data)           No database, no server
    Admin dashboard                 POS terminal only
    Network authority               Connects to admin IP
```

### How Members Connect Today (Browser Phase)

1. Admin starts the server on their machine
2. Member opens any browser on their PC
3. Types the admin's LAN IP: `http://192.168.1.34:3000`
4. Login page loads — member clicks **POS Staff** tab
5. Enters username and password created by admin
6. Lands directly on POS billing dashboard
7. Does billing — all data saves to admin's `awp.db`

---

## 6. Security Architecture — Three Layers

Security is enforced at three independent levels. All three would need to be bypassed simultaneously for an attack — not realistic in a LAN office environment.

### Layer 1 — Network Authority Hash (Machine Identity Lock)

During the first-run bootstrap, the admin machine's network interfaces (MAC addresses) are hashed using SHA-256 and stored in `awp.db` as `NetworkAuthority.networkHash`.

Every time an admin login is attempted, the current machine's network hash is recomputed and compared. If they do not match, the login is silently rejected — even with the correct password.

**Effect:** Admin credentials only work from the physical machine where bootstrap was performed.

### Layer 2 — Role-Based Middleware (Application Level)

`src/proxy.ts` (Next.js middleware) intercepts every request and checks the session role:

- `/admin/*` routes require ADMIN or MANAGER role — else redirect to `/unauthorized`
- `/pos/*` routes require MEMBER role — else redirect to `/login`
- `/login` — if already authenticated, redirect to the correct panel

**Effect:** A member account cannot access admin routes even if they know the URL.

### Layer 3 — Single-Session Token (Device Enforcement)

When a member logs in, a unique session token (UUID) is generated and saved in `awp.db`. The same token is embedded in the JWT session cookie.

On every request, the JWT callback verifies that the token in the cookie matches what is in the database. If a second login occurs on another device, the first device's token is invalidated and they are kicked out automatically.

**Effect:** One account = one active device at a time.

---

## 7. The .exe Packaging Plan

### Phase 2 Goal

Package the entire platform into a **single installable .exe** that works for both admin and member machines — with behavior determined at first launch, not by having separate installers.

### First-Launch Mode Selection

```
ABCD Work Platform — First Launch
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
Admin Server Mode    POS Terminal Mode
──────────────────   ─────────────────
"This PC hosts       "Connect to an
 the entire system"   existing server"
    │                    │
Starts Next.js server   Enter admin IP once
Opens awp.db            Saved to config file
Window → /admin         Window → {IP}/login
```

The mode chosen is saved to:
```
%APPDATA%\ABCD Work Platform\machine-mode.json
```

Every subsequent launch reads this file and boots the correct mode automatically. No prompt shown again.

### Admin Machine Behaviour (.exe)

- Starts the embedded Next.js server on port 3000
- Opens an Electron window locked to `http://localhost:3000/admin`
- Electron blocks navigation to any `/pos` route
- Has full access to `awp.db`
- NetworkAuthority hash ensures only this machine can log in as admin

### Member Machine Behaviour (.exe)

- Does NOT run any server — pure thin client
- Reads saved admin IP from local config
- Opens Electron window locked to `http://192.168.1.34:3000/login`
- After login, window is locked to `/pos` routes only
- Attempting to navigate to `/admin` is blocked at Electron level before the request is made
- If the admin IP changes: member opens Settings, updates IP, saved forever

---

## 8. Security in .exe Mode — Four Layers

| Layer | Mechanism | Effect |
|---|---|---|
| Layer 1 | NetworkAuthority MAC hash | Admin login rejected from non-admin machines |
| Layer 2 | Role-based middleware | Members cannot access `/admin` routes |
| Layer 3 | Single-session token | One device per account enforced |
| Layer 4 (new in .exe) | Electron URL lock | Member Electron window cannot navigate to admin routes — enforced at app level |

---

## 9. Data Flow — Member Billing (Complete Path)

```
Member clicks "Complete Checkout"
        │
        ▼
POST /api/pos/checkout
  Body: { jobId, qty, paymentMethod, customerPhone }
        │
        ▼
Server validates:
  - Session token valid?
  - Role = MEMBER?
  - Job template exists and is active?
        │
        ▼
Writes to awp.db (on admin machine):
  Transaction {
    transactionRef: "TM-20260411-1E3812",
    jobTitle: "1x Test Job Alpha [CASH]",
    totalAmount: 500,
    status: "PAID",
    memberId: "...",
    createdAt: 2026-04-11T...
  }
        │
        ▼
Returns receipt data to member
        │
        ▼
Member sees formatted receipt on screen
Admin dashboard reflects transaction on next load
Analytics charts include the new data
```

---

## 10. Roadmap Summary

### Phase 1 — Web / Local (COMPLETE)

- [x] Core Next.js application with full routing
- [x] Admin bootstrap, login, dashboard
- [x] Job management
- [x] Member management
- [x] POS billing with receipt
- [x] Analytics dashboard with charts
- [x] Audit logging
- [x] Security — MAC lock, role-based auth, single-session
- [x] Multi-admin support
- [x] TOTP 2FA support
- [x] Email recovery support (backend)
- [x] Member discovery API (backend)
- [x] Timezone bug fix in dashboard stats

### Phase 2 — Pre-Handover Cleanup (PENDING)

- [ ] Configure SMTP for email recovery to work
- [ ] Add TOTP setup UI so admin can enable 2FA from the dashboard
- [ ] Add "Connect to Server" UI on POS Staff login tab (for browser testing)
- [ ] Full manual test of multi-admin creation and permission inheritance

### Phase 3 — .exe Packaging (PLANNED)

- [ ] Restore Electron shell (clean, modular)
- [ ] Build first-launch mode selection screen (Admin Server / POS Terminal)
- [ ] Implement machine-mode config file system (`%APPDATA%`)
- [ ] Admin mode: lock Electron window to `/admin`, run embedded server
- [ ] Member mode: save server IP, lock window to `/pos`, no embedded server
- [ ] Settings screen for IP update on member machines
- [ ] Electron URL navigation blocking for member windows
- [ ] Build and sign single installer with electron-builder / NSIS
- [ ] Test multi-machine deployment on real LAN

---

## 11. Deployment Checklist (When Ready)

### Admin Machine Setup

1. Install `ABCD-Platform-Setup.exe`
2. First launch — choose **Admin Server Mode**
3. Bootstrap screen — fill admin name, username, password, recovery email
4. System generates network authority and saves admin identity
5. Admin dashboard opens — ready to use

### Member Machine Setup

1. Install same `ABCD-Platform-Setup.exe`
2. First launch — choose **POS Terminal Mode**
3. Enter the admin machine's LAN IP (visible in admin Settings page)
4. App connects, member login screen appears
5. Login with credentials created by admin
6. POS dashboard opens — ready to bill

### Network Requirements

- All machines on the same WiFi or LAN network
- Admin machine IP should be set to **static** on the router to prevent DHCP reassignment
- Port 3000 must be accessible (not blocked by Windows Firewall on admin machine)
- No internet required at runtime

---

*Project: ABCD Work Platform v1.0.5*
*Architecture documented: April 11, 2026*
*Next review: Before Phase 3 begins*
