"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";

async function requireJobsPermission() {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasPermission(session.user.role, "MANAGE_JOBS")) {
        throw new Error("Unauthorized: MANAGE_JOBS permission required.");
    }
    return session;
}

export async function createJobTemplate(formData: FormData) {
    await requireJobsPermission();

    const title = String(formData.get("title") || "").trim();
    const rawPrice = parseFloat(String(formData.get("basePrice") || "0"));
    const basePrice = Number.isFinite(rawPrice) && rawPrice >= 0 ? rawPrice : 0;
    const category = String(formData.get("category") || "").trim() || null;

    if (!title) return; // silently skip if title missing

    await prisma.jobTemplate.create({
        data: { title, basePrice, category },
    });
    revalidatePath("/admin/jobs");
}

export async function createJobOption(formData: FormData) {
    await requireJobsPermission();

    const jobId = String(formData.get("jobId") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const rawCost = parseFloat(String(formData.get("additionalCost") || "0"));
    const additionalCost = Number.isFinite(rawCost) && rawCost >= 0 ? rawCost : 0;

    if (!jobId || !name) return;

    await prisma.jobOption.create({
        data: { jobTemplateId: jobId, name, additionalCost },
    });
    revalidatePath("/admin/jobs");
}
