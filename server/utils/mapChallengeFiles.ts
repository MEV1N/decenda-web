import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const challengeFileMap: Record<string, string> = {
    // OLD GARAGE
    'garage_hammer': '/challanges/spot 1/harmer with old blood/hammer.jpg',
    'garage_boot': '/challanges/spot 1/boot print in oil/boot_printf (1).jpg',
    'garage_nail': '/challanges/spot 1/rusted nail with cloth/rustednail.jpg',

    // DRAINAGE PIT
    'drainage_boot': '/challanges/spot 9/mud on platform edge/mudtram',
    'drainage_blood': '/challanges/Vertical Blood smears/Vertical_Blood_Smears.pdf',
    'drainage_scratch': '/challanges/Concrete Scratches/HiddenScratches.png',
    'drainage_glove': '/challanges/Right leather glove/right_glove.png',
    'drainage_shoe': '/challanges/Discarded Shoes/Discarded Shoe.zip',
    'drainage_pill': '/challanges/Empty Blister/Empty Blister.zip',
    'drainage_mud': '/challanges/Mud trail Ending/bootprints2.png',
    'drainage_chalk': '/challanges/Chalk Symbol/layer2.bmp',

    // RESIDENTIAL ALLEY
    'alley_shoes': '/challanges/spot 5/socks with dried mud/socks-mud.zip',
    'alley_window': '/challanges/spot 3/forced window/Forced-Window.zip',
    'alley_left_glove': '/challanges/spot 7/lost keys/lost-keys.zip', // Adjusting based on available files
    'alley_mirror': '/challanges/spot 3/dirty mirror/Dirty.png',
    'alley_receipt': '/challanges/spot 3/pharmacy reciept/recipt.jpg',
    'alley_calendar': '/challanges/spot 3/cleander with circled date/token.py',

    // RIVERSIDE WALKWAY
    'river_chalk': '/challanges/Chalk crime 4/layer2.bmp',
    'river_mud': '/challanges/Mudside Compression/mud.zip',

    // DETECTIVE'S OFFICE
    'office_socks': '/challanges/spot 5/socks with dried mud/socks-mud.zip',
    'office_wall': '/challanges/spot 5/the wall photos/wall',

    // TOWN
    'town_boot': '/challanges/Boot shop/bootshop.py',
    'town_bills': '/challanges/Stick no bills/Stick no Bills.zip',

    // POLICE ANNEX
    'annex_hammer': '/challanges/spot 7/the reckless hammer/hammer.jpg',
    'annex_keys': '/challanges/spot 7/lost keys/lost-keys.zip',

    // CLINIC
    'clinic_records_med': '/challanges/Medical Records/Medical Records.zip',
    'clinic_mirror': '/challanges/Burned Mirror/mirror-20260306T040057Z-3-001.zip',
    'clinic_note': '/challanges/Clinic Recods/note.txt',
    'clinic_records': '/challanges/Clinic Recods/final_scan.png',

    // TRAM STATION
    'tram_oil': '/challanges/spot 9/Oil residue on rail/cytopto.txt',
    'tram_mud': '/challanges/spot 9/mud on platform edge/mudtram',
    'tram_recorder': '/challanges/spot 9/Recorder with breathing/wav.pdf.gz',
    'tram_blood': '/challanges/spot 9/old Blood smears on wall/old Blood smears on wall-20260306T035619Z-3-001.zip',

    // YOUR CAR
    'car_thoughts': '/challanges/Desperate Thoughts/thoughts.dd.sda1',
    'car_bills': '/challanges/Bills in dashboard/clinic_records.dat',
    'car_decenda': '/challanges/Decenda records/car_console',

    // YOUR HOUSE
    'house_keys': '/challanges/spot 7/lost keys/lost-keys.zip',
    'house_kettle': '/challanges/spot 11/burned kettle/crypto_archive_challenge.zip',
    'house_shoe': '/challanges/spot 11/other shoe was left/challenge.png',
    'house_room': '/challanges/spot 11/unordered room/archive.zip',
    'house_pills': '/challanges/spot 11/pill records/pillrecords.zip'
};

async function main() {
    console.log('Mapping challenge files...');
    let updatedCount = 0;

    for (const [challengeId, fileUrl] of Object.entries(challengeFileMap)) {
        try {
            const result = await prisma.challenge.updateMany({
                where: { id: challengeId },
                data: { file_url: fileUrl }
            });
            if (result.count > 0) {
                console.log(`[OK] Updated ${challengeId} -> ${fileUrl}`);
                updatedCount += result.count;
            } else {
                console.log(`[SKIP] Challenge ${challengeId} not found in DB`);
            }
        } catch (err: any) {
            console.error(`[ERROR] Failed to update ${challengeId}:`, err.message);
        }
    }

    console.log(`\nDone. Successfully mapped ${updatedCount} challenges.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
