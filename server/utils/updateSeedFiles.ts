import fs from 'fs';
import path from 'path';

const challengeFileMap: Record<string, string | null> = {
    // OLD GARAGE
    'garage_hammer': '/challanges/spot 1/harmer with old blood/hammer.jpg',
    'garage_boot': '/challanges/spot 1/boot print in oil/boot_printf (1).jpg',
    'garage_nail': '/challanges/spot 1/rusted nail with cloth/rustednail.jpg',
    'garage_oil': '/challanges/oil.apk',

    // DRAINAGE PIT
    'drainage_boot': '/challanges/spot 9/mud on platform edge/mudtram',
    'drainage_blood': '/challanges/Vertical Blood smears/Vertical_Blood_Smears.pdf',
    'drainage_scratch': '/challanges/Concrete Scratches/HiddenScratches.png',
    'drainage_glove': '/challanges/Right leather glove/right_glove.png',
    'drainage_mud': '/challanges/Mud trail Ending/bootprints2.png',
    'drainage_chalk': '/challanges/Chalk Symbol/layer2.bmp',

    // RESIDENTIAL ALLEY
    'alley_shoes': '/challanges/spot 5/socks with dried mud/socks-mud.zip',
    'alley_mirror': '/challanges/spot 3/dirty mirror/Dirty.png',
    'alley_receipt': '/challanges/spot 3/pharmacy reciept/recipt.jpg',
    'alley_calendar': '/challanges/spot 3/cleander with circled date/token.py',

    // RIVERSIDE WALKWAY
    'river_chalk': '/challanges/Chalk crime 4/layer2.bmp',
    'river_mud': '/challanges/Mudside Compression/mud.zip',

    // DETECTIVE'S OFFICE
    'office_socks': '/challanges/spot 5/socks with dried mud/socks-mud.zip',
    'office_wall': '/challanges/spot 5/the wall photos/wall',

    // POLICE ANNEX
    'annex_hammer': '/challanges/spot 7/the reckless hammer/hammer.jpg',

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
    'house_kettle': '/challanges/spot 11/burned kettle/crypto_archive_challenge.zip',
    'house_shoe': '/challanges/spot 11/other shoe was left/challenge.png',
    'house_room': '/challanges/spot 11/unordered room/archive.zip',
    'house_pills': '/challanges/spot 11/pill records/pillrecords.zip'
};

const seedFilePath = path.join(process.cwd(), 'server', 'seed.ts');
let seedContent = fs.readFileSync(seedFilePath, 'utf8');

let replaceCount = 0;

for (const [id, fileUrl] of Object.entries(challengeFileMap)) {
    if (!fileUrl) continue;

    // Regex matching the object with this ID to inject file_url
    // Before:    id: 'garage_hammer', location_id: 'old_garage', ... points: 10, ... }\n
    const regex = new RegExp(`(id:\\s*'${id}',.*?points:\\s*\\d+,)(.*?)(})`, 's');

    seedContent = seedContent.replace(regex, (match, p1, p2, p3) => {
        // If file_url is already there, update it
        if (p2.includes('file_url:')) {
            const updated = p2.replace(/file_url:\s*'.*?',/, `file_url: '${fileUrl}',`);
            return `${p1}${updated}${p3}`;
        }
        replaceCount++;
        return `${p1} file_url: '${fileUrl}',${p2}${p3}`;
    });
}

fs.writeFileSync(seedFilePath, seedContent, 'utf8');
console.log(`Updated ${replaceCount} challenges in seed.ts with file_url.`);
