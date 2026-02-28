import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const locs = await prisma.location.findMany({
        where: { is_starting: true }
    });
    console.log(locs.map(l => l.name));
}
check();
