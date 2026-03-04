# Design Document: CyberTrack Architecture

## 1. High-Level Architecture
We use a **Client-Server LAN Model**. 
- **The Server:** One PC (Admin's) acts as the "Source of Truth."
- **The Clients:** Other PCs or Tablets on the same Wi-Fi/LAN.

## 2. Data Modeling (The Schema)
- **User Table:** Stores `id`, `username`, `password_hash`, and `role` (ADMIN/MEMBER).
- **JobTemplate Table:** Stores the "Products" (e.g., Name: "Printing", BasePrice: 5).
- **JobOption Table:** Linked to Template (e.g., "Color" -> +10, "B&W" -> +0).
- **Transaction Table:** Stores the final record: `job_id`, `member_id`, `total_price`, `customer_name`, `timestamp`.

## 3. Access Control (RBAC)
- **Middleware-based Protection:** Every API route checks the user's JWT/Session role. 
- If a `Member` tries to access `/api/admin/analytics`, the server returns `403 Forbidden`.

## 4. Concurrency & Load Balancing
- Since we are running locally, "Load Balancing" is handled by the **Node.js Event Loop** and **Database Connection Pooling**. 
- **Prisma** will handle multiple members writing to the local DB simultaneously without data corruption.

## 5. Unique ID Generation
IDs will follow the pattern: `[MEMBER_ID]-[UNIX_TIMESTAMP]`. This ensures that even if two members click "Save" at the exact same millisecond, the IDs remain unique.
