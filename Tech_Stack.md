# Tech Stack: The "Self-Hosted" Suite

## 1. Frontend & Backend: Next.js (App Router)
- **Why:** Full-stack capability. You don't need a separate Express server.
- **Vibe Coding Tip:** Next.js is the most "AI-friendly" framework right now.

## 2. Database: PostgreSQL (Local)
- **Storage:** Stored on the Admin's Hard Drive. 
- **Tool:** Use **Docker** to run Postgres locally, or install **Postgres.app**.
- **Alternative (Full Cloud Free):** **Supabase** (Free tier) if you want a web-accessible DB.

## 3. ORM: Prisma
- **Why:** It gives you "Type Safety." If you change a job name, the whole app knows instantly.

## 4. Auth: NextAuth.js (Auth.js)
- **Strategy:** Credentials Provider (Username/Password).
- **Security:** Bcrypt for password hashing.

## 5. Local Networking
- **Host:** `0.0.0.0` (Allows local network devices to connect).
- **Discovery:** Members connect via `http://[ADMIN-IP]:3000`.

## 6. Payment (Zero-Fee)
- **Method:** Simple UPI String generation. 
- **No Gateway:** We aren't using Razorpay/Stripe (to avoid fees). We generate a QR that opens the customer's PhonePe/GPay directly.