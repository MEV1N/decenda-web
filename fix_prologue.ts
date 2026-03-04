import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log("Checking prologue...");
    const loc = await prisma.location.findUnique({ where: { id: 'prologue' } });
    console.log(loc);
    if (loc && !loc.is_starting) {
        console.log("Updating prologue to is_starting: true...");
        await prisma.location.update({
            where: { id: 'prologue' },
            data: { is_starting: true }
        });
        console.log("Done!");
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
