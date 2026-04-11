import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ──────────────────────────────────────────────────────────────────────────────
// Transaction ID format:
//
//   [NAME4][HHMMSS][DDMMYY][ORDER]
//
//   NAME4  : first 4 alpha characters of member's name, uppercase, space-free.
//            Padded with 'X' if name is shorter than 4 chars.
//            e.g. "Rahul Kumar" → "RAHU"
//
//   HHMMSS : server-local time when the transaction is created  (6 digits)
//            e.g. 14:30:52 → "143052"
//
//   DDMMYY : server-local date  (6 digits)
//            e.g. 11 Apr 2026 → "110426"
//
//   ORDER  : global daily order number, zero-padded to 3 digits minimum,
//            auto-incremented atomically inside a DB transaction.
//            Resets to 1 each new calendar day.
//            e.g. 1st bill of the day → "001", 42nd → "042", 1000th → "1000"
//
//   Full example: "RAHU143052110426001"
// ──────────────────────────────────────────────────────────────────────────────

/** Extract up to 4 uppercase alphabetic letters from a display name. */
function namePrefix(name: string): string {
    const letters = name.replace(/[^a-zA-Z]/g, "").toUpperCase();
    return letters.substring(0, 4).padEnd(4, "X");
}

/**
 * Atomically claim the next daily order number.
 *
 * Uses an upsert + update inside a serialized Prisma $transaction so that
 * two concurrent requests can never get the same number, even when both
 * arrive within the same millisecond.
 */
async function claimDailyOrderNumber(dateKey: string): Promise<number> {
    // SQLite serializes writes, but we still wrap in $transaction to make
    // the read-modify-write atomic and explicit.
    const result = await prisma.$transaction(async (tx) => {
        // Upsert: create with counter=1 if day has no row yet; otherwise bump.
        const row = await tx.dailyCounter.upsert({
            where: { dateKey },
            update: { counter: { increment: 1 } },
            create: { dateKey, counter: 1 },
        });
        return row.counter;
    });
    return result;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const jobTitle      = String(body.jobTitle || "").trim();
        const customerName  = body.customerName  ? String(body.customerName).trim()  : "";
        const customerPhone = body.customerPhone ? String(body.customerPhone).trim() : "";
        const totalAmount   = Number(body.totalAmount);

        // ── Input Validation ──────────────────────────────────────────────────
        if (!jobTitle) {
            return NextResponse.json({ error: "Job title is required" }, { status: 400 });
        }
        if (jobTitle.length > 120) {
            return NextResponse.json({ error: "Job title is too long" }, { status: 400 });
        }
        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
            return NextResponse.json({ error: "Total amount must be a positive number" }, { status: 400 });
        }
        if (customerPhone && !/^\d{10}$/.test(customerPhone)) {
            return NextResponse.json({ error: "Phone number must be exactly 10 digits" }, { status: 400 });
        }
        if (customerName && customerName.length > 120) {
            return NextResponse.json({ error: "Customer name is too long" }, { status: 400 });
        }

        // ── Auth: member can only bill under their own account ────────────────
        const memberId = session.user.id;
        const member = await prisma.user.findUnique({ where: { id: memberId } });
        if (!member) {
            return NextResponse.json({ error: "Invalid Member ID" }, { status: 400 });
        }

        // ── Build time/date segments ──────────────────────────────────────────
        const now = new Date();

        const HH   = String(now.getHours())            .padStart(2, "0");
        const MM   = String(now.getMinutes())           .padStart(2, "0");
        const SS   = String(now.getSeconds())           .padStart(2, "0");
        const DD   = String(now.getDate())              .padStart(2, "0");
        const mo   = String(now.getMonth() + 1)        .padStart(2, "0");
        const YY   = String(now.getFullYear()).slice(-2);

        const timePart = `${HH}${MM}${SS}`;   // HHMMSS
        const datePart = `${DD}${mo}${YY}`;   // DDMMYY  (dateKey for counter row)

        // ── Claim atomic order number ─────────────────────────────────────────
        const orderNo = await claimDailyOrderNumber(datePart);
        const orderPart = String(orderNo).padStart(3, "0"); // min 3 digits, grows naturally

        // ── Assemble final ref ────────────────────────────────────────────────
        const transactionRef = `${namePrefix(member.name)}${timePart}${datePart}${orderPart}`;
        // e.g. RAHU143052110426001

        // ── Persist ───────────────────────────────────────────────────────────
        const transaction = await prisma.transaction.create({
            data: {
                transactionRef,
                jobTitle,
                memberId,
                customerName:  customerName  || null,
                customerPhone: customerPhone || null,
                totalAmount,
                status: "PAID",
            },
        });

        return NextResponse.json({ success: true, transaction });

    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
    }
}
