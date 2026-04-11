import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import os from "os";
import prisma from "@/lib/prisma";
import { ensureIdentityFiles, readNetworkHash } from "@/lib/identity";
import { logAuditEvent } from "@/lib/audit";
import { generateMasterKey } from "@/lib/recovery";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = String(body.username || "").trim();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!username || !name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "A valid recovery email is required" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-32 characters and contain only letters, numbers, and underscore" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const authority = await prisma.networkAuthority.findUnique({ where: { id: "default" } });
    if (authority) {
      return NextResponse.json(
        { error: "Bootstrap is locked because authority is already initialized" },
        { status: 409 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser && existingUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Username already exists for non-admin user" }, { status: 409 });
    }

    ensureIdentityFiles();
    const networkHash = readNetworkHash();
    const passwordHash = await bcrypt.hash(password, 12);

    const masterKey = generateMasterKey();
    const masterKeyHash = await bcrypt.hash(masterKey, 12);

    const result = await prisma.$transaction(async (tx) => {
      let admin;

      if (existingUser && existingUser.role === "ADMIN") {
        admin = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            name,
            email,
            password: passwordHash,
            masterKeyHash,
            role: "ADMIN",
          },
        });
      } else {
        admin = await tx.user.create({
          data: {
            username,
            name,
            email,
            password: passwordHash,
            masterKeyHash,
            role: "ADMIN",
          },
        });
      }

      const authority = await tx.networkAuthority.upsert({
        where: { id: "default" },
        update: {
          networkHash,
          primaryAdminUserId: admin.id,
        },
        create: {
          id: "default",
          networkHash,
          primaryAdminUserId: admin.id,
        },
      });

      // Initialize ServerConfig with local IP for member discovery
      const interfaces = os.networkInterfaces();
      let localIp = "localhost";
      for (const iface of Object.values(interfaces)) {
        if (!iface) continue;
        for (const config of iface) {
          if (config.family === "IPv4" && !config.internal) {
            localIp = config.address;
            break;
          }
        }
        if (localIp !== "localhost") break;
      }

      await tx.serverConfig.upsert({
        where: { id: "default" },
        update: { serverHost: localIp },
        create: { id: "default", serverHost: localIp },
      });

      return { admin, authority, masterKey };
    });

    await logAuditEvent({
      actorUserId: result.admin.id,
      action: "BOOTSTRAP_ADMIN_SUCCESS",
      targetType: "NETWORK_AUTHORITY",
      targetId: result.authority.id,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: "Admin bootstrap complete",
      admin: {
        username: result.admin.username,
        name: result.admin.name,
        email: result.admin.email,
      },
      masterKey: result.masterKey,
      authorityId: result.authority.id,
    });
  } catch (error) {
    console.error("bootstrap-admin error", error);
    await logAuditEvent({
      action: "BOOTSTRAP_ADMIN_FAILED",
      targetType: "NETWORK_AUTHORITY",
      status: "FAILED",
      message: String(error),
    });
    return NextResponse.json(
      { error: "Failed to bootstrap admin" },
      { status: 500 }
    );
  }
}
