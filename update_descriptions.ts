import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const DESCRIPTIONS: Record<string, string> = {
    // OLD GARAGE
    'garage_boot': `At the Old Garage crime scene, investigators recovered a high\u2011resolution image of unusual boot impressions preserved in motor oil.\nThe gait pattern was repetitive.\nHeel\u2011heavy.\nDeliberate.\nThe image has been archived as:\nboot_printj.jpeg\nInitial inspection shows nothing beyond standard forensic photography.\nHowever, deeper analysis suggests the file contains hidden data.\nYour task:\nInvestigate the image file carefully.`,

    'garage_watch': `At the Old Garage crime scene, investigators recovered a cracked wristwatch belonging to the victim.\nThe glass was shattered.\nThe hands were frozen.\n3:17 AM.\nThe watch did not stop randomly.\nThe evidence has been archived as the website.\nInitial inspection reveals a simple web-based archival system related to horology records.\nHowever, deeper analysis suggests the system may contain hidden functionality tied to the frozen timestamp.\nYour task:\nInvestigate the archive carefully.\nLaunch the instance to get the resources.`,

    'garage_hammer': `At the Old Garage crime scene, investigators recovered the suspected murder weapon \u2014 a blood\u2011stained hammer resting in a pool of darkened oil.\nThe strikes were controlled.\nMeasured.\nIntentional.\nThe weapon has been archived as:\nhammer.jpg\nInitial inspection shows nothing beyond a standard forensic evidence photograph.\nHowever, deeper analysis suggests the image file may contain concealed data hidden beneath its surface.\nYour task:\nInvestigate the image carefully and recover the hidden flag.`,

    'garage_oil': `At the Old Garage crime scene, investigators collected a sample of oil residue traced along the exit path.\nThe stain pattern curved.\nConsistent.\nRepetitive.\nThe residue analysis archive has been stored as:\noil_residue.apk\nInitial inspection suggests it is a standard mobile application package related to forensic logging.\nHowever, deeper analysis indicates the file may contain concealed information within the apk.\nYour task:\nInvestigate the file carefully.`,

    'garage_nail': `At the Old Garage crime scene, investigators documented a rusted nail protruding from a support beam.\nCloth fibers were caught on its edge.\nDomestic.\nOut of place.\nThe evidence has been archived as:\nrusted_nail.jpg\nInitial inspection shows nothing beyond a standard forensic photograph of a corroded nail with trapped fabric strands.\nYour task:\nInvestigate the image carefully and recover the hidden flag.`,

    'garage_shelve': `At the Old Garage crime scene, investigators noticed a storage shelf slightly displaced from its original position.\nDust patterns were disturbed.\nDrag marks were visible.\nNothing appeared stolen.\nInitial inspection suggests it is a standard compiled output file with no obvious readable content.\nYour task:\nInvestigate the file carefully.`,

    // DRAINAGE PIT
    'drainage_boot': `At the Drainage Pit crime scene, investigators documented two separate boot impressions preserved in damp sediment.\nThe stride pattern was unstable.\nRepeated.\nFamiliar.\nInitial inspection shows nothing beyond standard forensic photographs of footwear impressions.\nHowever, deeper analysis suggests the files may contain concealed information hidden within their structure.\nYour task:\nInvestigate the image files carefully.`,

    'drainage_chalk': `At the Drainage Pit crime scene, investigators documented a faint chalk symbol marked along the concrete wall.\nThe lines were deliberate.\nRepetitive.\nIntentional.\nThe marking has been archived as:\nenc_flag\nInitial inspection suggests it is a standard encoded data encoded using chalk_enc.py.\nYour task:\nInvestigate the file carefully.`,

    'drainage_scratch': `At the Drainage Pit crime scene, investigators documented deep scratch marks carved into the inner concrete wall.\nThe grooves were vertical.\nUneven.\nRepeated.\nThe evidence has been archived as:\nconcrete_scratches.png\nInitial inspection shows nothing beyond a standard forensic image of surface damage.\nYour task:\nInvestigate the image file carefully.`,

    'drainage_shoe': `At the Drainage Pit crime scene, investigators recovered a single discarded shoe partially submerged in damp sediment.\nIt was removed deliberately.\nLeft behind.\nUnpaired.\nThe evidence has been archived as a webpage.\nInitial inspection shows a minimal forensic webpage displaying the drainage pit scene and the recovered shoe.\nHowever, deeper analysis suggests the page may contain hidden functionality capable of revealing additional evidence.\nYour task:\nInvestigate the webpage carefully.\nStart the instance to get further information.`,

    'drainage_mud': `At the Drainage Pit crime scene, investigators observed a mud trail that advanced toward the concrete wall \u2014 and then stopped abruptly.\nNo return prints.\nNo fall marks.\nNo continuation.\nThe evidence has been archived as:\nmud_trail.txt\nInitial inspection shows a plain text file containing an unusual sequence of binary data.\nYour task:\nInvestigate the file carefully.`,

    'drainage_glove': `At the Drainage Pit crime scene, investigators recovered a single right-hand glove lodged behind a concrete ledge.\nIts pair was missing.\nIts placement deliberate.\nLeft behind.\nThe evidence has been archived as:\nright_glove.png\nInitial inspection shows nothing beyond a standard forensic photograph of the recovered glove.\nYour task:\nInvestigate the image file carefully and recover the hidden flag.`,

    'drainage_blood': `At the Drainage Pit crime scene, investigators documented vertical blood smears along the inner concrete wall.\nThe streaks were downward.\nControlled.\nUnresisting.\nThe forensic documentation has been archived as:\nVertical_Blood_Smears.pdf\nInitial inspection reveals a standard incident report describing the blood pattern analysis and scene observations.\nYour task:\nInvestigate the file carefully and recover the complete flag.`,

    // RESIDENTIAL ALLEY
    'alley_mirror': `At the Residential Alley crime scene, investigators documented a fogged and partially wiped bathroom mirror.\nThe surface was smeared.\nDistorted.\nUntrusted.\nThe evidence has been archived as:\ndirty_mirror.jpg\nInitial inspection shows nothing beyond a standard forensic photograph of a stained mirror surface.\nHowever, deeper analysis suggests the image may conceal more info hidden beneath its visible layer.\nYour task:\nInvestigate the image carefully and recover the hidden flag.`,

    'alley_receipt': `At the Town investigation site, officers recovered a pharmacy receipt linked to recent medication purchases.\nThe timestamp matched prior incidents.\nThe prescription was altered.\nThe paper trail was incomplete.\nThe evidence has been archived as:\npharmacy_receipt.jpg\nInitial inspection reveals a standard receipt image and a separate file containing an unusual dash\u2011separated hexadecimal sequence.\nHowever, deeper analysis suggests the image may conceal critical information required to interpret the encrypted data.\nYour task:\nInvestigate file carefully and recover the hidden flag.`,

    'alley_shoes': `At the Residential Alley crime scene, investigators observed a neatly arranged pair of shoes placed beside the entrance.\nThey were aligned precisely.\nSymmetrical.\nDeliberate.\nThe evidence has been archived as:\nshoes.apk\nInitial inspection suggests it is a standard mobile application package with no visible anomalies.\nYour task:\nInvestigate the file carefully.`,

    'alley_window': `At the Residential Alley crime scene, investigators examined a window reported as "forced" during entry.\nThe glass was intact.\nNo splintered frame.\nNo shattered latch.\nThe evidence has been archived as a website.\nInitial inspection reveals a simple web interface displaying a dimly lit window scene and a short riddle prompting user input.\nHowever, deeper analysis suggests the page logic may reveal hidden behavior based on precise observations.\nYour task:\nInvestigate the webpage carefully and determine the correct input to reveal the hidden flag.`,

    // RIVERSIDE WALKWAY
    'river_chalk': `At the Riverside Walkway crime scene, investigators documented a faint chalk marking drawn near the water's edge.\nThe lines were repeated.\nDirectional.\nGuiding.\nThe evidence has been archived as:\nlayer2.bmp\nInitial inspection shows nothing beyond a standard image of the riverside walkway surface.\nYour task:\nInvestigate the image file carefully and recover the hidden flag.`,

    // POLICE ANNEX
    'annex_hammer': `At the Old Garage crime scene, investigators recovered a second image of the weapon \u2014 a reckless hammer captured mid-swing in surveillance reconstruction.\nThe motion was aggressive.\nDistracting.\nLoud.\nThe evidence has been archived as:\nreckless_hammer.jpg\nInitial inspection shows nothing beyond a standard forensic image of the recovered hammer.\nHowever, deeper analysis suggests the image may conceal additional data related to hidden network activity.\nYour task:\nInvestigate the image file carefully and uncover what lies beneath the surface.`,

    // TRAM STATION
    'tram_oil': `At the Train Station crime scene, investigators documented a thin oil residue trailing along the platform edge.\nThe spill was controlled.\nDirectional.\nRecent.\nThe forensic data has been archived as:\nstation_oil_trace.txt\nInitial inspection reveals a set of hexadecimal values accompanied by a fixed initialization vector.\nHowever, deeper analysis suggests the encryption process may contain a structural weakness that exposes hidden information.\nYour task:\nInvestigate the provided data carefully and recover the hidden flag.`,
};

async function main() {
    console.log('Updating challenge descriptions...');
    for (const [id, description] of Object.entries(DESCRIPTIONS)) {
        await prisma.challenge.update({
            where: { id },
            data: { description }
        });
        console.log(`✓ Updated: ${id}`);
    }
    console.log('\nAll descriptions updated successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
