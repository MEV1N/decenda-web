import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const challenges = await prisma.challenge.findMany({
        where: { location_id: 'prologue' }
    });
    console.log(challenges.map(c => c.title));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
