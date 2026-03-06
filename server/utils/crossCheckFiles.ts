import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const challenges = await prisma.challenge.findMany({
        orderBy: { location_id: 'asc' }
    });

    console.log("=================================================");
    console.log("CHALLENGE FILE MAPPING CROSS-CHECK");
    console.log("=================================================");

    let missingFiles = 0;
    let mappedCount = 0;
    let noMapCount = 0;

    for (const chal of challenges) {
        if (!chal.file_url) {
            console.log(`[NO MAPPING] ID: ${chal.id.padEnd(20)} TITLE: ${chal.title}`);
            noMapCount++;
            continue;
        }

        // File URL is expected to be /challanges/...
        // The actual path on disk is public/challanges/...
        const decodedUrl = decodeURIComponent(chal.file_url);
        const relativePath = decodedUrl.startsWith('/') ? decodedUrl.substring(1) : decodedUrl;
        const diskPath = path.join(process.cwd(), 'public', relativePath);

        const exists = fs.existsSync(diskPath);

        if (exists) {
            console.log(`[OK]      ID: ${chal.id.padEnd(20)} TITLE: ${chal.title.padEnd(30)}`);
            console.log(`          FILE: ${decodedUrl}`);
            mappedCount++;
        } else {
            console.log(`[MISSING] ID: ${chal.id.padEnd(20)} TITLE: ${chal.title.padEnd(30)}`);
            console.log(`          EXPECTED FILE: ${decodedUrl}`);
            console.log(`          PATH CHECKED: ${diskPath}`);
            missingFiles++;
        }
    }

    console.log("\n=================================================");
    console.log(`Summary:`);
    console.log(`Total Challenges: ${challenges.length}`);
    console.log(`Mapped and file exists: ${mappedCount}`);
    console.log(`Mapped but file missing: ${missingFiles}`);
    console.log(`Not mapped: ${noMapCount}`);
    console.log("=================================================");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
