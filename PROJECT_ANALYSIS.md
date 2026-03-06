# CyberTrack POS: Comprehensive Project Analysis & Documentation

This document serves as the absolute source of truth for the CyberTrack POS architecture. It breaks down the complete feature set, explicit workflows, and provides an exhaustive analysis of **every single file** present in the repository.

---

## 1. Project Overview & Core Features

**CyberTrack POS** is a locally-hosted, offline-resilient Point of Sale platform designed to handle direct Walk-In customers, configure custom jobs mathematically, calculate totals securely, and generate Zero-Cost UPI QR code payments without relying on cloud gateways.

### Key Features
1. **Dynamic Job Calculator:** Staff can click base services (e.g., Printing) and toggle add-on options (e.g., Color +₹5). The client automatically calculates the mathematical total.
2. **Zero-Cost UPI Payment Gateway:** Leveraging `qrcode.react`, the platform instantly encodes the Admin's configured UPI address (`NEXT_PUBLIC_ADMIN_UPI`) and exact transaction total into a scannable `upi://pay` QR code directly on checkout.
3. **Traceable Custom Receipts:** Transactions skip default database strings and automatically formulate human-readable, traceable IDs (e.g., `[INITIALS]-[YYYYMMDD]-[RANDOM]`) mapped exactly to the staff member who rang it up.
4. **Role-Based Access Control (RBAC):** NextAuth strictly segregates `ADMIN` users from `MEMBER` (staff) users. Members are physically blocked from loading `/admin` routes by the edge middleware.
5. **Admin Analytics Dashboard:** Prisma's backend `$groupBy` functions natively aggregate all completed transactions to automatically showcase total revenue and flag the Top Performing Member via a visual Trophy Card.
6. **Live Presence Tracking:** Web sockets and NextAuth callbacks track when staff logs in, turning their dashboard indicator to a Green "Online" dot, and timestamps their Last Seen records.

---

## 2. Core Workflows

### A. The Point-Of-Sale (POS) Checkout Workflow
1. **Trigger:** A walk-in customer requests a service.
2. **Action:** The logged-in Member opens `/pos`.
3. **Selection:** They click a dynamic `JobTemplate` Card (e.g., "Scanning").
4. **Configuration:** They toggle specific `JobOption` checkboxes and adjust the Quantity counter. UI updates live total.
5. **Payment:** The Member selects either "UPI / QR" or "Cash" via the new Payment Method toggle. If UPI is selected, the QR encodes for the current total. Customer scans to pay.
6. **Fulfillment:** Member verifies payment received and clicks "Complete Transaction".
7. **Database Action:** Extracted payload hits `/api/transaction`, generating the custom trace ID (`SA-2026...`), appending the Payment Method to the snapshot (e.g. `[CASH]`), and persisting the layout to MongoDB. 

### B. The Admin Job Creation Workflow
1. **Trigger:** The shop begins offering a new service (e.g., Lamination).
2. **Action:** The Admin navigates to `/admin/jobs`.
3. **Creation:** They open the Server Action Dialog, inputting the name "Lamination" and Base Price, and hit Save.
4. **Enhancement:** They click "Add Option" on the new card, creating "A3 Size" for +₹10.
5. **Propagation:** The React Cache drops. The new service instantly maps across all connected Member POS tablets in real-time.

---

## 3. Exhaustive File Directory Analysis

### Root Configuration Files
- **`package.json` & `package-lock.json`**: Controls all Node modules, library versions, and executable scripts (`npm run dev`).
- **`next.config.ts`**: The strict builder configurations for Next.js 15 routing.
- **`tsconfig.json`**: Rules for compiling TypeScript across the project safely.
- **`tailwind.config.ts` & `postcss.config.mjs`**: Dictates all class-based CSS styling variables mapping colors and component structures.
- **`components.json`**: Tracks the specialized GUI elements installed globally via `shadcn/ui`.
- **`.env`**: The absolute security layer. Secures the `DATABASE_URL`, NextAuth hashes, and the Master Bank `NEXT_PUBLIC_ADMIN_UPI` string.
- **`middleware.ts`**: The edge-runtime firewall. It physically inspects user session tokens upon routing and forcefully blocks `MEMBER` roles from rendering ANY paths matching `/admin/*`.

### `/prisma` (Database Maps)
- **`schema.prisma`**: The heart of the MongoDB data structure. Contains the exact typed `Models` for User tracking, Job templates, Options, and transaction references. 
- **`seed.ts`**: The emergency initialization script. Firing `npx prisma db seed` boots an admin account directly into a blank cluster.

### `/src/lib` (Core Functions)
- **`prisma.ts`**: A global Node execution cache designed to stop Next.js from spamming thousands of MongoDB connection instances on hot-reloads.
- **`auth.ts`**: The core NextAuth controller. Dictates the dual-credential logic (Username/Passwords), executes Bcrypt verification algorithms, and manages the session JSON payload generation.
- **`utils.ts`**: UI structural merging algorithms generated explicitly for Tailwind design arrays via `clsx` and `tailwind-merge`.

### `/src/components` (Reusable Architecture)
- **`/ui/`**: Houses 10+ decoupled React components (Buttons, Cards, Forms, Dialogs, Checkboxes) generated by ShadCN ensuring universal visual consistency.
- **`providers.tsx`**: A heavy wrapper layer enveloping `/src/app/layout.tsx`. It provides the `SessionProvider` allowing client components to detect exactly who is logged in.
- **`SignOutButton.tsx`**: Intercepts standard logouts to execute a dedicated `/api/auth/logout` ping first—turning the user's `isOnline` tracking physically Off in the database before clearing the local cookies.

### `/src/app/api` (Backend Endpoints)
- **`/auth/[...nextauth]/route.ts`**: The dynamic router listening for NextAuth gateway handshakes.
- **`/auth/logout/route.ts`**: Updates the Prisma User cluster marking `isOnline: false` when explicitly pinged.
- **`/transaction/route.ts`**: The core POS processor. Authenticates the member ID, fetches initials dynamically, stamps a date-time array, builds the traceable `transactionRef`, and pushes the completed purchase receipt to MongoDB.

### `/src/app/login` (Authentication)
- **`page.tsx`**: The graphical gatekeeper. Renders distinct "POS Staff" and "Admin Portal" visual tabs. Routes directly intercept successful login arrays, validating the `session.user.role` to force 100% accurate redirects to either `/pos` or `/admin`.

### `/src/app/admin` (Administrative Dashboard)
- **`layout.tsx`**: Provides the structural Sidebar and fixed Navigations unique uniquely to the `/admin` experience.
- **`page.tsx`**: The main Top-Level Analytics Hub. Executes complex chained Prisma `$groupBy` algorithms to process revenue calculations and generate the Top Performer Member Trophy logic dynamically.
- **`/members/page.tsx`**: The heavy Server Component fetching all mapped Users and rendering the Employee interface table.
- **`/members/MemberDialog.tsx`**: A Server Action pop-up used by Admins to securely mint Usernames and Passwords for their POS staff offline.
- **`/members/MemberRow.tsx`**: A highly interactive Client Component. Maps individual employee rows, drives the Green/Red Online Status arrays, and hosts the specialized "Eye" icon script that toggles plain-text tracking passwords.
- **`/jobs/page.tsx`**: The Server Component rendering the "Job Catalog", listing all mapped JobTemplates within Prisma.
- **`/jobs/JobDialog.tsx` & `JobOptionDialog.tsx`**: The UI arrays dictating new feature catalogs. Pushes directly to Prisma to edit Job Base Prices or append dynamic Extra Options (like Glossy Finish).

### `/src/app/pos` (Member Point-of-Sale)
- **`layout.tsx`**: Validates the `MEMBER` session token before rendering the POS header.
- **`page.tsx`**: Fetches the live `JobTemplate` matrix from Prisma, including deep nested `JobOption` relationships to push down into the client UI.
- **`POSDashboard.tsx`**: The structural backbone of the software. This client component runs pure mathematical calculations handling state management via React `useState`. It tracks checkboxes, computes Quantity Arrays, builds dynamic Title Snapshots mapping the exact Payment Method UI toggle (Cash vs UPI), actively renders the `qrcode.react` API string instantly, and securely blasts the payload JSON to `/api/transaction` upon completion.
