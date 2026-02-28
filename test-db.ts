import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Testing DB connection...");
    try {
        const locations = await prisma.location.count();
        console.log(`Successfully connected! Found ${locations} locations.`);
    } catch (e: any) {
        console.error("Connection failed:", e.message);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
