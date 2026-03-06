import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const challengeFileMap: Record<string, string | null> = {
    // OLD GARAGE
    'garage_hammer': '/challanges/spot 1/harmer with old blood/hammer.jpg',
    'garage_boot': '/challanges/spot 1/boot print in oil/boot_printf (1).jpg',
    'garage_nail': '/challanges/spot 1/rusted nail with cloth/rustednail.jpg',
    'garage_watch': null, // Cracked watch
    'garage_oil': '/challanges/oil.apk',

    // DRAINAGE PIT
    'drainage_boot': '/challanges/drainage boots.zip',
    'drainage_blood': '/challanges/Vertical Blood smears/Vertical_Blood_Smears.pdf',
    'drainage_scratch': '/challanges/Concrete Scratches/HiddenScratches.png',
    'drainage_glove': '/challanges/Right leather glove/right_glove.png',
    'drainage_shoe': null, // Discarded shoe
    'drainage_pill': null, // Empty blister
    'drainage_mud': '/challanges/Mud trail Ending/mud_txt',
    'drainage_chalk': '/challanges/Chalk Symbol.zip',

    // RESIDENTIAL ALLEY
    'alley_shoes': '/challanges/shoes.apk',
    'alley_window': null, // Forced window
    'alley_left_glove': null, // Lost keys / glove
    'alley_mirror': '/challanges/spot 3/dirty mirror/Dirty.png',
    'alley_receipt': '/challanges/spot 3/pharmacy reciept/recipt.jpg',
    'alley_calendar': '/challanges/cleander with circled date/token.py', // Calendar with circled dates

    // RIVERSIDE WALKWAY
    'river_chalk': '/challanges/Chalk crime 4/layer2.bmp',
    'river_mud': '/challanges/Mudside Compression/mud.zip',
    'river_boot': null, // Boot prints
    'river_heel': '/challenges/Heel pivot Impression/clues.txt', // Heel pivot (the fall?)

    // DETECTIVE'S OFFICE
    'office_socks': '/challanges/spot 5/socks with dried mud/socks-mud.zip',
    'office_wall': '/challanges/spot 5/the wall photos/wall',
    'office_records': null, // Medicine and parasomnia records

    // TOWN
    'town_boot': '/challanges/Boot shop/bootshop.zip', // Boot shop
    'town_bills': null, // Stick no bills

    // POLICE ANNEX
    'annex_hammer': '/challanges/spot 7/the reckless hammer/hammer.jpg',
    'annex_keys': null, // Lost keys

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
    'house_keys': null, // Lost keys
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
                console.log(`[OK] Updated ${challengeId} -> ${fileUrl === null ? 'NULL (Removed file)' : fileUrl}`);
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
