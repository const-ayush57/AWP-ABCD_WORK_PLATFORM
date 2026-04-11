import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed script: Initialize database structures (NOT default users).
 * 
 * Production-Ready Bootstrap Flow:
 * 1. On first app start, admin sees "Primary Admin Setup" page
 * 2. Admin creates themselves via /api/system/bootstrap-admin
 * 3. Admin logs in and configures network authority
 * 4. Members are created by admin, authenticate against admin server
 * 
 * This seed script runs ONLY once during build; it does NOT create users.
 * Intentionally left minimal to support self-service admin creation.
 */

async function main() {
    console.log('✓ Database seed initialized')
    console.log('✓ On first app start, the admin will create themselves via secure bootstrap UI')
    console.log('✓ No default credentials are seeded for production security')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
