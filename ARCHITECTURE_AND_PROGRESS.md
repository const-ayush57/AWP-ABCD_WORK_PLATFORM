# Project Architecture & Progress Report

## System Architecture
This project is built using a modern full-stack web architecture with the following core technologies:

```mermaid
graph TD
    Staff([POS Staff]) -->|Accesses /pos| POS
    Adm([Administrator]) -->|Accesses /admin| AdminDash
    
    subgraph "Application Layer (Next.js 15 App Router)"
        Middleware[NextAuth Middleware\nRole Protection]
        Login[Login Gateway\n/login]
        
        POS[Point of Sale UI\nClient Components]
        AdminDash[Admin Dashboard\nServer Components]
        
        API_Auth[Auth/Logout API\n/api/auth/*]
        API_Txn[Transaction API\n/api/transaction]
        API_Actions[React Server Actions\nMembers & Jobs]
    end

    Staff -.-> Middleware
    Adm -.-> Middleware
    Middleware --> Login
    Login --> POS
    Login --> AdminDash
    
    POS --> API_Txn
    POS --> API_Auth
    AdminDash --> API_Actions
    AdminDash --> API_Auth
    
    subgraph "Data Access Layer"
        Prisma[Prisma ORM Client\nType-safe Queries]
    end
    
    API_Txn --> Prisma
    API_Auth --> Prisma
    API_Actions --> Prisma
    
    subgraph "Storage Layer"
        MongoDB[(MongoDB Replica Set)]
        Schema[Schema Defines:\n- User (Admin/Member)\n- JobTemplate\n- JobOption\n- Transaction]
        MongoDB -.-> Schema
    end
    
    Prisma <--> |Reads & Writes| MongoDB
```

### Frontend
- **Framework:** Next.js 15 (App Router). Server Components are used for data-fetching, while Client Components are strictly used for interactivity (e.g., forms, toggles, client state).
- **Styling:** Tailwind CSS combined with `shadcn/ui` for rapid, responsive, and highly polished component design.
- **State Management:** React Hooks (`useState`, `useContext` via SessionProvider) combined with form-driven server actions.

### Backend & Database
- **Backend Environment:** Next.js Route Handlers (`/api`) and internal Server Actions.
- **Authentication System:** NextAuth.js (v4) utilizing a custom Credentials Provider paired with `bcrypt` for password hashing. Real-world sessions are handled securely via JWT encryptions tied to NextAuth.
- **Database Architecture:** MongoDB configured as an active local Replica Set (necessary for Prisma integrations with document NoSQL behaviors).
- **ORM:** Prisma Client. It provides a heavily typed interface for defining schemas and accurately querying the MongoDB cluster without writing raw code logic.

### Security Paradigm
- **Role-Based Access Control (RBAC):** Users are forcibly assigned either an `ADMIN` or `MEMBER` role.
- **Route Protection Layers:** Next.js `middleware.ts` intercepts sub-path requests at the edge. It acts as a firewall physically blocking `MEMBER` accounts from accessing any `/admin/*` routes.
- **Secure Dual-Password Paradigm:** Admin-created passwords for members denote a dual-store approach on the Prisma model: `password` (hashed heavily via bcrypt for actual secure logic) and `plainPassword` (stored uniquely purely for the Admin to view/recover the exact texts for the staff).

---

## Change Log: Completed Features, Error Fixes, and Application Progress

### 1. Database & Security Migration
- Successfully transitioned the application's core data persistence from local PostgreSQL testing to a robust MongoDB integration.
- Created updated `schema.prisma` configurations mapping out the precise `User` and `Transaction` relationships, safely generating internal clients.
- Deactivated all global development authentication bypasses. The application is now fully locked down enforcing firm login credentials.

### 2. User Authentication Interfaces & Routing
- Developed an Admin-only, heavily protected user creation system. Members cannot sign themselves up; they must use explicit accounts initialized by an Administrator inside the dashboard.
- Successfully re-architected the Authentication Gateway (`/login` page) to supply a dual-entry tabs interface ("Admin Portal" and "POS Staff"). 
- **Critical Bug Fixed:** Handled deeply rooted unauthorized routing loops where a logging-in Member was previously forced to load `/admin` only to be viciously rejected backward. The server client now intercepts and intelligently routes POS staff to `/pos` automatically upon successful login checks.

### 3. Admin Dashboard Enhancements
- Engineered comprehensive data visibility on the `/admin/members` table panel mapping individual rows independently.
- **Feature added:** Live Password Toggle logic. Built a dedicated `MemberRow.tsx` client component that safely unhides/hides staff members' actual text passwords natively within the browser without refreshing the layout.
- **UI Bug Fixed:** Bound strict width configurations (`w-32 inline-block font-mono overflow-hidden whitespace-nowrap`) onto the password cells globally, successfully eliminating all jarring layout snapping errors when text lengths change upon toggle.
- Refactored the core action controls, compressing text-heavy elements cleanly into slick, optimized icon triggers (like the trash SVG element for removal). 

### 4. Advanced Staff Presence Tracking (Online/Offline Status Ping)
- Dynamically injected `isOnline` and `lastSeen` relational fields to the base Prisma infrastructure mapping system.
- **Major Stability Fix:** Successfully targeted an obscure rendering drop crash (`PrismaClientKnownRequestError` - Error Code P2032). Investigated the logs, identified legacy missing data structures on older internal test accounts, and resolved it firmly by explicitly marking all live status fields as functionally optional parsing items (`?`). Verified fix by executing fresh schema pushes and pinging the live server routes raw.
- Booted updated NextAuth core configurations natively reading successful logins to flip `isOnline` tracking to `true` while dropping a synchronized database timestamp onto `lastSeen`.
- Built custom REST API endpoints (`/api/auth/logout`) that securely communicate with a globally embedded `SignOutButton.tsx` navigation shell—explicitly telling MongoDB to securely downgrade the targeted user's `isOnline` state to accurately reflect real-world inactivity across the Admin dashboard status dots.

### 5. Revenue & Jobs Engine
- **Dynamic Job Options Engine:** Validated the POS interface mathematical calculations, confirming the system flawless adds and scales `JobOption` additional costs against the mapped `JobTemplate` base price for exact tracking.
- **Unique Traceable Receipt IDs:** Rewrote the Transaction REST API to explicitly fetch the MongoDB member profile, extract exactly three initialized letters of the real-world staffing name, and append them defensively onto a traceable `[INITIALS]-[YYYYMMDD]-[RANDOM_4_CHAR]` format (e.g., `NIH-20260304-X8F2`).
- **Zero-Cost QR Payment Trigger:** Implemented `qrcode.react` inside `POSDashboard.tsx` to encode live, strictly formatted `upi://pay` URI strings. Safely integrated the master `NEXT_PUBLIC_ADMIN_UPI` string directly within `.env` parameters, actively pointing live payments to the explicit `8447436163@ybl` bank endpoint!
- **Top Performer Analytics Card:** Advanced the Admin Dashboard analytical capabilities via complex Prisma `groupBy` filtering parameters natively measuring the `_sum` of all `PAID` transactions over time securely mapped sequentially to individual Member profiles, successfully displaying a localized "Top Performer" Trophy card!

---

## Project File Structure
Information regarding the core files present in this CyberTrack POS repository.

### Root Level
- `package.json` / `package-lock.json`: Contains project metadata, npm scripts, and tracks installed dependencies.
- `tsconfig.json`: Configuration for the TypeScript compiler.
- `next.config.ts`: Next.js configuration settings for optimized builds.
- `.env`: Stores environment variables securely, primarily the `DATABASE_URL` (MongoDB connection string) and `NEXTAUTH_SECRET`.
- `tailwind.config.ts` / `postcss.config.mjs`: Styling configuration for Tailwind CSS allowing rapid utility-first design.
- `components.json`: Configuration for shadcn/ui components integration.
- `middleware.ts`: Next.js middleware that runs before every request. Crucial for role-based access control (RBAC). It checks if a user is authenticated and restricts `MEMBER` accounts from accessing `/admin` routes gracefully.

### `/prisma`
- `schema.prisma`: The central truth for the database structure. Configured for MongoDB, it defines models like `User` (for Members/Admins) and `Transaction`.
- `seed.ts`: A script used to populate the database with an initial default Admin user upon setup.

### `/src/lib`
- `auth.ts`: NextAuth configuration logic. Defines the `credentials` provider, handles bcrypt password hashing/verification, configures JWT/session callbacks, and manages the `isOnline` and `lastSeen` user status updates.
- `prisma.ts`: A global singleton instantiation of the `PrismaClient` to prevent opening too many database connections during hot-reloading in development mode.
- `utils.ts`: General helper functions, commonly used by shadcn/ui for merging Tailwind CSS classes (`cn`).

### `/src/app/api`
- `[...nextauth]/route.ts`: Exposes the NextAuth endpoints required by the authentication library.
- `/auth/logout/route.ts`: A custom API endpoint triggered upon user logout. It securely pings MongoDB to set the `isOnline` field back to `false`.
- `/transaction/route.ts`: The core endpoint for the POS Revenue Engine. It securely validates internal `userId` session tokens, dynamically creates custom receipt IDs (`[INITIALS]-[YYYYMMDD]-[RANDOM]`), and officially pushes the finalized `PAID` payload onto the Transaction cluster.

### `/src/components`
- `/ui/*`: Various reusable UI components generated by shadcn (Buttons, Inputs, Cards, Tables, Dialogs).
- `providers.tsx`: Wraps the entire application in the NextAuth `SessionProvider`, allowing child components to read the user's logged-in session state anywhere.
- `SignOutButton.tsx`: A reusable client component that handles the custom logout logic (updating status, then clearing local session via NextAuth's `signOut`).

### `/src/app/login`
- `page.tsx`: The authentication interface. It features two distinct tabs (Admin Portal and POS Staff), submitting credentials to NextAuth, and intelligently redirecting users to `/pos` or `/admin` based on their validated roles to prevent unauthorized access loops.

### `/src/app/admin`
- `layout.tsx`: Renders the Admin dashboard sidebar navigation and enforces layout consistency across all `/admin` routes.
- `page.tsx`: The main overview dashboard for administrators mapping out live metrics.
- `/members/page.tsx`: The server-rendered page that fetches users from the database. It constructs the admin lists and handles the raw server actions for adding new Members.
- `/members/MemberRow.tsx`: A client component representing a single row in the member table. It manages local state for toggling the user's password visibility and visually renders their online/offline status dots cleanly.
- `/jobs/page.tsx` & `JobOptionDialog.tsx`: Interfaces targeted for managing Jobs/Services offered by the POS.

### `/src/app/pos`
- `layout.tsx`: The main POS application shell. It verifies the session securely and provides a unified header before rendering the billing mechanisms.
- `POSDashboard.tsx`: The primary Point of Sale interface designed for `MEMBER` (staff) accounts to handle cart calculations, search items, and finalize transactions securely linking heavily back into the Prisma ORM.
