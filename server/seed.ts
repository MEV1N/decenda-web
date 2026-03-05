import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LOCATIONS = [
    // PROLOGUE
    { id: 'prologue', name: 'PROLOGUE: CSP #112', description: 'The Shepherd Case File', is_starting: true },

    // STARTING
    { id: 'old_garage', name: 'OLD GARAGE', description: 'The Old Garage stands at the edge of the industrial district, half-forgotten and permanently shadowed by taller concrete structures around it. Its corrugated metal door is rust-streaked, slightly misaligned, and groans when moved. Inside, the air smells of old oil, damp wood, and cold iron. Tools hang in careful order along the walls, yet a thin layer of dust suggests long periods of stillness between use. Oil stains spread across the floor in dark, overlapping patterns  some old, some disturbingly fresh.', is_starting: true },
    { id: 'drainage_pit', name: 'DRAINAGE PIT', description: 'Behind the abandoned textile factory lies a place most of Gravenfall pretends not to see a forgotten drainage pit swallowed by shadow and silence.', is_starting: true },
    { id: 'residential_alley', name: 'RESIDENTIAL ALLEY', description: 'Tucked between aging apartment blocks, the Residential Alley appears ordinary at first glance — quiet, narrow, and dimly lit by a single flickering streetlamp. Laundry lines sway slightly above, and the air carries faint traces of detergent and cooking oil. It feels lived-in. Safe.\n\nBut the longer you stand there, the more unnatural the order becomes.', is_starting: true },

    // UNLOCKED VIA EVIDENCE
    { id: 'riverside_walkway', name: 'RIVERSIDE WALKWAY', description: 'Beyond the city’s noise, where Gravenfall’s concrete gives way to water and fog, the riverside walkway stretches in quiet isolation. Streetlamps flicker weakly above damp stone. The railing is rusted. The river moves slowly, black and indifferent.\n\nThis place does not feel like a murder scene.\n\nIt feels like hesitation.', is_starting: false },
    { id: 'detective_office', name: 'DETECTIVE\'S OFFICE', description: 'Every crime spot is mapped outward — garage, pit, alley, river, station.\nBut when you step back, the strings do not radiate outward.\n\nThey circle inward.\n\nAll paths cross through you — your timelines, your assignments, your field visits.\n\nThe wall was never mapping a killer.\n\nIt was mapping your absence.', is_starting: false },
    { id: 'town', name: 'TOWN', description: 'The Town is not a single room or abandoned structure.\n\nIt is public space — shops, records, storefronts, ordinary daylight movement.\n\nUnlike the other crime spots, this one is not hidden.\n\nIt exists in plain sight.', is_starting: false },
    { id: 'police_annex', name: 'GRAVENFALL POLICE ANNEX', description: 'The Gravenfall Police Annex stands apart from the main civic buildings — older, heavier, built from dark stone that absorbs light instead of reflecting it. The windows are narrow. The corridors echo. It feels less like a workplace and more like a vault for unfinished things.\n\nThis is where cases go when they stop making sense.', is_starting: false },
    { id: 'clinic', name: 'CLINIC', description: 'Hidden behind a fading medical sign and dust-covered glass doors, the abandoned clinic stands in uneasy stillness. It doesn’t look destroyed — it looks paused. Cabinets remain intact. Examination tables are undisturbed. Files are missing in patterns, not chaos.\n\nThe air carries the faint scent of antiseptic beneath mold and neglect — a place that once treated conditions quietly, methodically.', is_starting: false },
    { id: 'tram_station', name: 'TRAM STATION', description: 'At the edge of Gravenfall’s transit grid sits a tram station that no longer appears on updated maps. The signage is faded. The ticket machines are dead. Wind moves through the open platform like something searching for sound.\n\nThis is not a crime scene in the traditional sense.\n\nIt is a movement node.', is_starting: false },
    { id: 'your_car', name: 'YOUR CAR', description: 'Parked outside your apartment. Locked. Ordinary.\n\nBut this is where denial starts breaking.\n\nThis is not a public crime scene.\n\nThis is private continuity evidence.', is_starting: false },
    { id: 'your_house', name: 'YOUR HOUSE', description: 'On the outskirts of Gravenfall stands a temporary housing complex meant for short-term residents — traveling workers, displaced tenants, people between lives. Identical doors. Identical rooms. No one stays long enough to be remembered.\n\nThis is not a violent crime scene.\n\nThis is a personal fracture site.', is_starting: false },
];

const CHALLENGES = [
    // PROLOGUE CSP #112
    {
        id: 'prologue_stego', location_id: 'prologue',
        title: 'The Fourth Body', description: 'At twelve minutes past the third hour after midnight, I was summoned once more.\n\nAnother residence of respectable standing. No shattered lock. No disturbed furnishings. No cry had pierced the night.\n\nShe had been laid upon the carpet with a care bordering upon reverence. Her hands were folded as though in prayer. The curtains were drawn tight against the indifferent moon. Her shoes were set neatly beside her.\n\nA single candle rested near her temple. Unlit.\n\nUpon the plastered wall, written in a steady hand: *"I only free them."*\n\nThe apothecary’s examination revealed a draught of powerful sedatives, administered with exacting precision. There had been no struggle, no mark of violence.\n\nThey had admitted him willingly.\n\nThat is the singular horror of it.\n\nHe does not force entry.\n\nHe is received as a guest.',
        flag: 'dec{tru5t_w4s_th3_w34pon@mbc.ctf}', points: 0, unlocksLocations: [],
    },
    {
        id: 'prologue_crypto', location_id: 'prologue',
        title: 'Mercy', description: 'Four departed souls. No apparent relation by blood, trade, nor acquaintance.\n\nYet inquiry revealed a common thread.\n\nEach had, within a fortnight of their demise, attended a small assembly devoted to the consolation of the bereaved.\n\nA private circle. Discreet. Of modest number.\n\nThe gentleman presiding over these gatherings described the deceased as “lost spirits.” He maintained that he sought only to guide them toward peace.\n\n*Guide them.*\n\nThe word lingered unpleasantly in my thoughts.\n\nLike a shepherd tending his flock.',
        flag: 'dec{guid3d_th3_l05t@mbc.ctf}', points: 0, unlocksLocations: [],
    },
    {
        id: 'prologue_rev', location_id: 'prologue',
        title: 'The Ritual', description: 'The candles found beside the bodies were of uncommon make—hand-poured, fashioned from a particular wax known to but a few craftsmen in the city.\n\nOnly one patron purchased such candles in notable quantity.\n\nThe account was registered under a charitable foundation dedicated to counsel and spiritual comfort.\n\nThe same institution overseen by the leader of the mourning circle.\n\nHe possessed a voice of soothing timbre, eyes that reflected sympathy, and a handshake neither firm nor weak.\n\nThe sort of gentleman to whom widows confess their despair.\n\nThe sort who listens without interruption.\n\nAnd thereafter, decides.\n\nAmong his papers lay a narrow scrap of parchment bearing a peculiar instruction:\n\n“Take them two by two.\nRaise the first eight degrees above the second.\nBind them into one voice.”\n\nBeneath it, a single line of notation:\n\n`enc = "".join([chr((ord(flag[i]) << 8) + ord(flag[i + 1])) for i in range(0, len(flag), 2)])`\n\nTwo letters joined into one.\nLifted. Combined. Concealed.\n\nJust as he had done before.',
        flag: 'dec{th3_w4x_l3d_t0_him@mbc.ctf}', points: 0, unlocksLocations: [],
    },
    {
        id: 'prologue_forensics', location_id: 'prologue',
        title: 'The Test', description: 'I resolved to attend one of his gatherings.\n\nWe sat in a circle, the lamplight casting long shadows upon the paneled walls. One by one, the mourners spoke of sorrow.\n\nWhen his turn came, he discoursed upon suffering as though it were not an affliction but a threshold.\n\n“Some souls,” he said gently, “are prepared to step through.”\n\nHis gaze settled upon me when he uttered those words.\n\nNot long.\n\nBut long enough.\n\nWhen the meeting concluded, he approached and suggested I remain behind for private conversation. He observed that I appeared fatigued. That I bore a hidden burden.\n\nHe smiled with the confidence of one who believes himself understood.\n\nIn that instant, clarity dawned.\n\nHis victims were not chosen at hazard.\n\nThey were examined.\n\nMeasured.\n\nJudged.',
        flag: 'dec{not_r4nd0m_but_ch0s3n@mbc.ctf}', points: 0, unlocksLocations: [],
        file_url: '/challange/testfindings.pdf',
    },
    {
        id: 'prologue_web', location_id: 'prologue',
        title: 'The Shepherd Falls', description: 'I had taken the precaution of concealment—officers waited beyond earshot.\n\nAt last, the gentleman laid aside his pastoral guise.\n\nHe spoke in hushed tones of release, of serenity, of the crossing from anguish into eternal quiet.\n\nHe termed it mercy.\n\nHe deemed himself indispensable.\n\nWhen I inquired how many he had thus “liberated,” he did not protest.\n\nHe amended my reckoning.\n\n“Five,” he replied evenly.\n\n“You would have been the sixth.”\n\nBefore his hand could reach the syringe secreted within his escritoire, the constables entered.\n\nHe offered no resistance. Displayed no agitation.\n\nOnly disappointment.\n\nAs irons were clasped about his wrists, he inclined his head toward me and whispered:\n\n“You shall come to see it. They were grateful.”\n\nPerhaps, in the disordered chambers of his mind, he believes this.\n\nSuch men do not behold blood.\n\nThey behold design.\n\nYet on this night, the shepherd tended no flock.\n\nOn this night—\n\nHe was the one led away.',
        flag: 'dec{m3rcy_w4s_th3_li3@mbc.ctf}', points: 0, unlocksLocations: [],
        instance_required: true,
    },

    // 1. OLD GARAGE (STARTING)
    {
        id: 'garage_hammer', location_id: 'old_garage',
        title: 'Hammer with blood', description: 'At the Old Garage crime scene, investigators recovered the suspected murder weapon — a blood‑stained hammer resting in a pool of darkened oil.\nThe strikes were controlled.\nMeasured.\nIntentional.\nThe weapon has been archived as:\nhammer.jpg\nInitial inspection shows nothing beyond a standard forensic evidence photograph.\nHowever, deeper analysis suggests the image file may contain concealed data hidden beneath its surface.\nYour task:\nInvestigate the image carefully and recover the hidden flag.',
        flag: 'dec{garage_hammer}', points: 10, unlocksLocations: ['police_annex'], // logic: -> Reckless Hammer
    },
    {
        id: 'garage_pin', location_id: 'old_garage',
        title: 'Broken pin with lock', description: 'Forced entry?',
        flag: 'dec{garage_pin}', points: 10, unlocksLocations: [],
    },
    {
        id: 'garage_boot', location_id: 'old_garage',
        title: 'Boot prints in oil', description: 'At the Old Garage crime scene, investigators recovered a high‑resolution image of unusual boot impressions preserved in motor oil.\nThe gait pattern was repetitive.\nHeel‑heavy.\nDeliberate.\nThe image has been archived as:\nboot_printj.jpeg\nInitial inspection shows nothing beyond standard forensic photography.\nHowever, deeper analysis suggests the file contains hidden data.\nYour task:\nInvestigate the image file carefully.',
        flag: 'dec{garage_boot}', points: 10, unlocksLocations: ['drainage_pit'], // logic: -> Boot prints (Drainage pit)
    },
    {
        id: 'garage_watch', location_id: 'old_garage',
        title: 'Cracked watch 3:17', description: 'At the Old Garage crime scene, investigators recovered a cracked wristwatch belonging to the victim.\nThe glass was shattered.\nThe hands were frozen.\n3:17 AM.\nThe watch did not stop randomly.\nThe evidence has been archived as the website.\nInitial inspection reveals a simple web-based archival system related to horology records.\nHowever, deeper analysis suggests the system may contain hidden functionality tied to the frozen timestamp.\nYour task:\nInvestigate the archive carefully.\nLaunch the instance to get the resources.',
        flag: 'dec{garage_watch}', points: 10, unlocksLocations: [], // unlocked by timeline logic later, but for now it's just evidence
    },
    {
        id: 'garage_nail', location_id: 'old_garage',
        title: 'Rested nail with cloth', description: 'At the Old Garage crime scene, investigators documented a rusted nail protruding from a support beam.\nCloth fibers were caught on its edge.\nDomestic.\nOut of place.\nThe evidence has been archived as:\nrusted_nail.jpg\nInitial inspection shows nothing beyond a standard forensic photograph of a corroded nail with trapped fabric strands.\nYour task:\nInvestigate the image carefully and recover the hidden flag.',
        flag: 'dec{garage_nail}', points: 10, unlocksLocations: ['residential_alley'], // logic: -> Missing Towel
    },
    {
        id: 'garage_shelve', location_id: 'old_garage',
        title: 'Shifted shelve with track', description: 'At the Old Garage crime scene, investigators noticed a storage shelf slightly displaced from its original position.\nDust patterns were disturbed.\nDrag marks were visible.\nNothing appeared stolen.\nInitial inspection suggests it is a standard compiled output file with no obvious readable content.\nYour task:\nInvestigate the file carefully.',
        flag: 'dec{garage_shelve}', points: 10, unlocksLocations: [], // Dead end
    },
    {
        id: 'garage_oil', location_id: 'old_garage',
        title: 'Oil residue', description: 'At the Old Garage crime scene, investigators collected a sample of oil residue traced along the exit path.\nThe stain pattern curved.\nConsistent.\nRepetitive.\nThe residue analysis archive has been stored as:\noil_residue.apk\nInitial inspection suggests it is a standard mobile application package related to forensic logging.\nHowever, deeper analysis indicates the file may contain concealed information within the apk.\nYour task:\nInvestigate the file carefully.',
        flag: 'dec{garage_oil}', points: 10, unlocksLocations: ['tram_station'], // logic: -> oil res on rail
    },

    // 2. DRAINAGE PIT
    {
        id: 'drainage_boot', location_id: 'drainage_pit',
        title: 'Boot prints', description: 'At the Drainage Pit crime scene, investigators documented two separate boot impressions preserved in damp sediment.\nThe stride pattern was unstable.\nRepeated.\nFamiliar.\nInitial inspection shows nothing beyond standard forensic photographs of footwear impressions.\nHowever, deeper analysis suggests the files may contain concealed information hidden within their structure.\nYour task:\nInvestigate the image files carefully.',
        flag: 'dec{drainage_boot}', points: 10, unlocksLocations: ['riverside_walkway'], // logic: -> foot prints with 1 boot and 1 leg
    },
    {
        id: 'drainage_blood', location_id: 'drainage_pit',
        title: 'Vertical blood smears', description: 'At the Drainage Pit crime scene, investigators documented vertical blood smears along the inner concrete wall.\nThe streaks were downward.\nControlled.\nUnresisting.\nThe forensic documentation has been archived as:\nVertical_Blood_Smears.pdf\nInitial inspection reveals a standard incident report describing the blood pattern analysis and scene observations.\nYour task:\nInvestigate the file carefully and recover the complete flag.',
        flag: 'dec{drainage_blood}', points: 10, unlocksLocations: ['tram_station'], // logic: -> old Blood smears on wall
    },
    {
        id: 'drainage_scratch', location_id: 'drainage_pit',
        title: 'Concrete scratches', description: 'At the Drainage Pit crime scene, investigators documented deep scratch marks carved into the inner concrete wall.\nThe grooves were vertical.\nUneven.\nRepeated.\nThe evidence has been archived as:\nconcrete_scratches.png\nInitial inspection shows nothing beyond a standard forensic image of surface damage.\nYour task:\nInvestigate the image file carefully.',
        flag: 'dec{drainage_scratch}', points: 10, unlocksLocations: [],
    },
    {
        id: 'drainage_glove', location_id: 'drainage_pit',
        title: 'Right leather glove', description: 'At the Drainage Pit crime scene, investigators recovered a single right-hand glove lodged behind a concrete ledge.\nIts pair was missing.\nIts placement deliberate.\nLeft behind.\nThe evidence has been archived as:\nright_glove.png\nInitial inspection shows nothing beyond a standard forensic photograph of the recovered glove.\nYour task:\nInvestigate the image file carefully and recover the hidden flag.',
        flag: 'dec{drainage_glove}', points: 10, unlocksLocations: ['residential_alley'], // logic: -> Left glove
    },
    {
        id: 'drainage_shoe', location_id: 'drainage_pit',
        title: 'Discarded shoe (1)', description: 'At the Drainage Pit crime scene, investigators recovered a single discarded shoe partially submerged in damp sediment.\nIt was removed deliberately.\nLeft behind.\nUnpaired.\nThe evidence has been archived as a webpage.\nInitial inspection shows a minimal forensic webpage displaying the drainage pit scene and the recovered shoe.\nHowever, deeper analysis suggests the page may contain hidden functionality capable of revealing additional evidence.\nYour task:\nInvestigate the webpage carefully.\nStart the instance to get further information.',
        flag: 'dec{drainage_shoe}', points: 50, unlocksLocations: ['town'], // logic: -> Shoe's store
    },
    {
        id: 'drainage_pill', location_id: 'drainage_pit',
        title: 'Empty pill wrap', description: 'Killer’s medicine. Launch instance to investigate the blister pack markings.',
        flag: 'dec{drainage_pill}', points: 20, unlocksLocations: ['clinic'],
        instance_required: true,
    },
    {
        id: 'drainage_mud', location_id: 'drainage_pit',
        title: 'Mud trail ending mid wall', description: 'At the Drainage Pit crime scene, investigators observed a mud trail that advanced toward the concrete wall — and then stopped abruptly.\nNo return prints.\nNo fall marks.\nNo continuation.\nThe evidence has been archived as:\nmud_trail.txt\nInitial inspection shows a plain text file containing an unusual sequence of binary data.\nYour task:\nInvestigate the file carefully.',
        flag: 'dec{drainage_mud}', points: 5, unlocksLocations: [], // dead end
    },
    {
        id: 'drainage_chalk', location_id: 'drainage_pit',
        title: 'Faint chalk symbol', description: 'At the Drainage Pit crime scene, investigators documented a faint chalk symbol marked along the concrete wall.\nThe lines were deliberate.\nRepetitive.\nIntentional.\nThe marking has been archived as:\nenc_flag\nInitial inspection suggests it is a standard encoded data encoded using chalk_enc.py.\nYour task:\nInvestigate the file carefully.',
        flag: 'dec{drainage_chalk}', points: 10, unlocksLocations: ['riverside_walkway'], // logic: -> riverside walkway (dead end)
    },
    {
        id: 'drainage_water', location_id: 'drainage_pit',
        title: 'Water line marks', description: 'Shows mark of someone resting there.',
        flag: 'dec{drainage_water}', points: 10, unlocksLocations: [],
    },

    // 3. RESIDENTIAL ALLEY
    {
        id: 'alley_shoes', location_id: 'residential_alley',
        title: 'Shoes aligned', description: 'At the Residential Alley crime scene, investigators observed a neatly arranged pair of shoes placed beside the entrance.\nThey were aligned precisely.\nSymmetrical.\nDeliberate.\nThe evidence has been archived as:\nshoes.apk\nInitial inspection suggests it is a standard mobile application package with no visible anomalies.\nYour task:\nInvestigate the file carefully.',
        flag: 'dec{alley_shoes}', points: 10, unlocksLocations: [],
    },
    {
        id: 'alley_window', location_id: 'residential_alley',
        title: 'Forced window', description: 'At the Residential Alley crime scene, investigators examined a window reported as \'forced\' during entry.\nThe glass was intact.\nNo splintered frame.\nNo shattered latch.\nThe evidence has been archived as a website.\nInitial inspection reveals a simple web interface displaying a dimly lit window scene and a short riddle prompting user input.\nHowever, deeper analysis suggests the page logic may reveal hidden behavior based on precise observations.\nYour task:\nInvestigate the webpage carefully and determine the correct input to reveal the hidden flag.',
        flag: 'dec{alley_window}', points: 20, unlocksLocations: [],
    },
    {
        id: 'alley_left_glove', location_id: 'residential_alley',
        title: 'Left leather glove', description: 'Matches the right glove from the pit.',
        flag: 'dec{alley_left_glove}', points: 20, unlocksLocations: ['town'], // logic: -> Glove shop
    },
    {
        id: 'alley_mirror', location_id: 'residential_alley',
        title: 'Dirty mirror', description: 'At the Residential Alley crime scene, investigators documented a fogged and partially wiped bathroom mirror.\nThe surface was smeared.\nDistorted.\nUntrusted.\nThe evidence has been archived as:\ndirty_mirror.jpg\nInitial inspection shows nothing beyond a standard forensic photograph of a stained mirror surface.\nHowever, deeper analysis suggests the image may conceal more info hidden beneath its visible layer.\nYour task:\nInvestigate the image carefully and recover the hidden flag.',
        flag: 'dec{alley_mirror}', points: 15, unlocksLocations: ['clinic'], // logic: -> Burned Mirror
    },
    {
        id: 'alley_towel', location_id: 'residential_alley',
        title: 'Missing towel', description: 'Linked to the rested nail cloth in the garage.',
        flag: 'dec{alley_towel}', points: 10, unlocksLocations: [],
    },
    {
        id: 'alley_receipt', location_id: 'residential_alley',
        title: 'Pharmacy receipt', description: 'At the Town investigation site, officers recovered a pharmacy receipt linked to recent medication purchases.\nThe timestamp matched prior incidents.\nThe prescription was altered.\nThe paper trail was incomplete.\nThe evidence has been archived as:\npharmacy_receipt.jpg\nInitial inspection reveals a standard receipt image and a separate file containing an unusual dash-separated hexadecimal sequence.\nHowever, deeper analysis suggests the image may conceal critical information required to interpret the encrypted data.\nYour task:\nInvestigate file carefully and recover the hidden flag.',
        flag: 'dec{alley_receipt}', points: 30, unlocksLocations: [], // logic -> The SOMNARCH (dead end)
    },
    {
        id: 'alley_calendar', location_id: 'residential_alley',
        title: 'Calendar with circled dates', description: 'Dates marked in red.',
        flag: 'dec{alley_calendar}', points: 30, unlocksLocations: ['clinic'], // logic: -> dates match missing clinic log entries
    },

    // RIVERSIDE WALKWAY
    {
        id: 'river_chalk', location_id: 'riverside_walkway',
        title: 'Chalk symbol', description: 'At the Riverside Walkway crime scene, investigators documented a faint chalk marking drawn near the water\'s edge.\nThe lines were repeated.\nDirectional.\nGuiding.\nThe evidence has been archived as:\nlayer2.bmp\nInitial inspection shows nothing beyond a standard image of the riverside walkway surface.\nYour task:\nInvestigate the image file carefully and recover the hidden flag.',
        flag: 'dec{river_chalk}', points: 5, unlocksLocations: [],
    },
    {
        id: 'river_boot', location_id: 'riverside_walkway',
        title: 'Boot prints', description: 'Foot prints with 1 boot and 1 leg. Connected from drainage. Launch instance to investigate the pressure patterns.',
        flag: 'dec{river_boot}', points: 10, unlocksLocations: [],
        instance_required: true,
    },
    {
        id: 'river_heel', location_id: 'riverside_walkway',
        title: 'Heel pivot impressions near edge', description: 'Someone slipped or turned sharply.',
        flag: 'dec{river_heel}', points: 10, unlocksLocations: [],
    },
    {
        id: 'river_mud', location_id: 'riverside_walkway',
        title: 'Mud side compression', description: 'Heavy sinking mud.',
        flag: 'dec{river_mud}', points: 20, unlocksLocations: ['detective_office'], // logic: -> socks with dried mud
    },

    // DETECTIVE'S OFFICE
    {
        id: 'office_socks', location_id: 'detective_office',
        title: 'Socks with dried mud', description: 'Linked to riverside mud.',
        flag: 'dec{office_socks}', points: 20, unlocksLocations: ['tram_station'], // logic: -> Mud on platform edge
    },
    {
        id: 'office_wall', location_id: 'detective_office',
        title: 'The Wall (Photos, Strings, Notes)', description: 'Timeline and observations linking the crime.',
        flag: 'dec{office_wall}', points: 30, unlocksLocations: ['town'], // logic: -> stick no bills
    },
    {
        id: 'office_folder', location_id: 'detective_office',
        title: 'DECENDA Folder', description: 'Medicine and parasomnia records.',
        flag: 'dec{office_folder}', points: 50, unlocksLocations: [], // Connected from car decenda records
    },
    {
        id: 'office_somnarch', location_id: 'detective_office',
        title: 'The SOMNARCH', description: 'Dead end profile from the pharmacy receipt.',
        flag: 'dec{office_somnarch}', points: 20, unlocksLocations: [],
    },
    {
        id: 'office_note', location_id: 'detective_office',
        title: 'Similar handwritten note', description: 'A strange note you definitely didn\'t write... did you?',
        flag: 'dec{office_note}', points: 30, unlocksLocations: ['police_annex'], // logic: -> note (police station)
    },
    {
        id: 'office_notebook', location_id: 'detective_office',
        title: 'Blank Notebook on Desk with torn paper', description: 'Indents of a ripped page.',
        flag: 'dec{office_notebook}', points: 40, unlocksLocations: ['your_house'], // logic: -> torn paper (house)
    },
    {
        id: 'office_confession', location_id: 'detective_office',
        title: 'Strange confession', description: 'Major plot (dead end).',
        flag: 'dec{office_confession}', points: 50, unlocksLocations: [],
    },

    // TOWN
    {
        id: 'town_glove', location_id: 'town',
        title: 'Glove shop', description: 'Sold out of left leather gloves. (dead end)',
        flag: 'dec{town_glove}', points: 10, unlocksLocations: [], // from left glove
    },
    {
        id: 'town_boot', location_id: 'town',
        title: 'Boot shop', description: 'Sells the same brand as the discarded shoe.',
        flag: 'dec{town_boot}', points: 20, unlocksLocations: ['your_house'], // logic: -> Other Shoe (Major Role)
    },
    {
        id: 'town_bills', location_id: 'town',
        title: 'Stick no bills', description: 'Found via The Wall strings. Launch instance to check the digital database of community notices.',
        flag: 'dec{town_bills}', points: 10, unlocksLocations: [],
        instance_required: true,
    },

    // POLICE ANNEX
    {
        id: 'annex_files', location_id: 'police_annex',
        title: 'Archived Murder Files (Recent & Historical)', description: 'Matches timeline.',
        flag: 'dec{annex_files}', points: 30, unlocksLocations: ['tram_station'], // logic: -> recorded breathing
    },
    {
        id: 'annex_hammer', location_id: 'police_annex',
        title: 'The reckless hammer', description: 'At the Old Garage crime scene, investigators recovered a second image of the weapon — a reckless hammer captured mid-swing in surveillance reconstruction.\nThe motion was aggressive.\nDistracting.\nLoud.\nThe evidence has been archived as:\nreckless_hammer.jpg\nInitial inspection shows nothing beyond a standard forensic image of the recovered hammer.\nHowever, deeper analysis suggests the image may conceal additional data related to hidden network activity.\nYour task:\nInvestigate the image file carefully and uncover what lies beneath the surface.',
        flag: 'dec{annex_hammer}', points: 10, unlocksLocations: [],
    },
    {
        id: 'annex_keys', location_id: 'police_annex',
        title: 'Lost keys', description: 'Linked to locked area in clinic. Launch instance to analyze the key cuts and locksmith records.',
        flag: 'dec{annex_keys}', points: 20, unlocksLocations: ['your_house'],
        instance_required: true,
    },
    {
        id: 'annex_note', location_id: 'police_annex',
        title: 'Hand written note', description: 'Matches office note handwriting.',
        flag: 'dec{annex_note}', points: 30, unlocksLocations: ['clinic'], // logic: -> note (clinic)
    },

    // CLINIC
    {
        id: 'clinic_records_med', location_id: 'clinic',
        title: 'Medical records', description: 'Matches empty pill wrap.',
        flag: 'dec{clinic_records_med}', points: 30, unlocksLocations: ['residential_alley'], // logic: -> Pharmacy receipt
    },
    {
        id: 'clinic_logs', location_id: 'clinic',
        title: 'Security log gaps', description: 'From recorded breathing (tram station) -> leads to cracked watch 3:17 (garage)',
        flag: 'dec{clinic_logs}', points: 30, unlocksLocations: [], // Points back to garage watch conceptually
    },
    {
        id: 'clinic_mirror', location_id: 'clinic',
        title: 'Burned Mirror', description: 'Connected to dirty mirror.',
        flag: 'dec{clinic_mirror}', points: 20, unlocksLocations: [],
    },
    {
        id: 'clinic_note', location_id: 'clinic',
        title: 'Handwritten note in drawer', description: 'Matches annex note.',
        flag: 'dec{clinic_note}', points: 30, unlocksLocations: ['your_car'], // logic: -> Bill in dashboard
    },
    {
        id: 'clinic_lock', location_id: 'clinic',
        title: 'A locked area', description: 'Needs keys to access.',
        flag: 'dec{clinic_lock}', points: 20, unlocksLocations: ['police_annex'], // logic: -> lost keys
    },
    {
        id: 'clinic_records', location_id: 'clinic',
        title: 'Clinic records', description: 'From dashboard bill.',
        flag: 'dec{clinic_records}', points: 40, unlocksLocations: ['your_house'], // logic: -> Pill records
    },

    // TRAM STATION
    {
        id: 'tram_oil', location_id: 'tram_station',
        title: 'Oil residue on rail', description: 'At the Train Station crime scene, investigators documented a thin oil residue trailing along the platform edge.\nThe spill was controlled.\nDirectional.\nRecent.\nThe forensic data has been archived as:\nstation_oil_trace.txt\nInitial inspection reveals a set of hexadecimal values accompanied by a fixed initialization vector.\nHowever, deeper analysis suggests the encryption process may contain a structural weakness that exposes hidden information.\nYour task:\nInvestigate the provided data carefully and recover the hidden flag.',
        flag: 'dec{tram_oil}', points: 15, unlocksLocations: [],
    },
    {
        id: 'tram_mud', location_id: 'tram_station',
        title: 'Mud on platform edge', description: 'Matches socks with mud.',
        flag: 'dec{tram_mud}', points: 15, unlocksLocations: [],
    },
    {
        id: 'tram_recorder', location_id: 'tram_station',
        title: 'Recorder with breathing', description: 'From archived files.',
        flag: 'dec{tram_recorder}', points: 30, unlocksLocations: ['clinic'], // logic: -> Security log gaps
    },
    {
        id: 'tram_blood', location_id: 'tram_station',
        title: 'Old Blood smears on wall', description: 'Matches vertical smears from pit.',
        flag: 'dec{tram_blood}', points: 15, unlocksLocations: [],
    },

    // YOUR CAR
    {
        id: 'car_thoughts', location_id: 'your_car',
        title: 'Desperate thoughts', description: '(dead end)',
        flag: 'dec{car_thoughts}', points: 10, unlocksLocations: [],
    },
    {
        id: 'car_bills', location_id: 'your_car',
        title: 'Bills in dashboard', description: 'From clinic note.',
        flag: 'dec{car_bills}', points: 30, unlocksLocations: ['clinic'], // logic: -> Clinic records
    },
    {
        id: 'car_decenda', location_id: 'your_car',
        title: 'Decenda records', description: 'Secretive findings.',
        flag: 'dec{car_decenda}', points: 30, unlocksLocations: ['detective_office'], // logic: -> decenda folder
    },

    // YOUR HOUSE
    {
        id: 'house_keys', location_id: 'your_house',
        title: 'Keys ("The coat reveals")', description: 'From lost keys.',
        flag: 'dec{house_keys}', points: 20, unlocksLocations: [],
    },
    {
        id: 'house_kettle', location_id: 'your_house',
        title: 'Burned kettle', description: '(dead end)',
        flag: 'dec{house_kettle}', points: 10, unlocksLocations: [],
    },
    {
        id: 'house_shoe', location_id: 'your_house',
        title: 'Other shoe which was left out', description: 'Major Role. Matches the shoe store.',
        flag: 'dec{house_shoe}', points: 100, unlocksLocations: [],
    },
    {
        id: 'house_room', location_id: 'your_house',
        title: 'Unordered room', description: '(dead end)',
        flag: 'dec{house_room}', points: 10, unlocksLocations: [],
    },
    {
        id: 'house_pills', location_id: 'your_house',
        title: 'Pill records and pills', description: 'From clinic records.',
        flag: 'dec{house_pills}', points: 50, unlocksLocations: [],
    },
    {
        id: 'house_paper', location_id: 'your_house',
        title: 'Torn paper books', description: 'From blank notebook. Leads to final verdict.',
        flag: 'dec{house_paper}', points: 100, unlocksLocations: [], // In practice, unlocking Final Verdict would be a special case or node.
    },
    {
        // FINAL VERDICT (Implicitly modeled as a challenge at the house or its own node)
        id: 'house_verdict', location_id: 'your_house',
        title: 'Final Verdict: (He\'s Somnarch)', description: 'The truth revealed. You are the Somnarch killer.',
        flag: 'dec{somnarch}', points: 1000, unlocksLocations: [],
    }
];

async function main() {
    console.log('Cleaning up existing data...');
    await prisma.unlockedLocation.deleteMany();
    await prisma.solve.deleteMany();
    await prisma.hint.deleteMany();
    await prisma.challenge.deleteMany();
    await prisma.location.deleteMany();

    console.log('Seeding locations...');
    for (const loc of LOCATIONS) {
        await prisma.location.create({ data: loc });
    }

    console.log('Seeding challenges with plain text flags...');

    for (const chal of CHALLENGES) {
        await prisma.challenge.create({
            data: {
                id: chal.id,
                location_id: chal.location_id,
                title: chal.title,
                description: chal.description,
                flag_hash: chal.flag,
                points: chal.points,
                instance_required: (chal as any).instance_required || false,
                unlocksLocations: chal.unlocksLocations,
            }
        });

        console.log(`Created challenge: ${chal.title} (${chal.flag})`);
    }

    console.log('Seeding complete! Admin user can be created manually or via register endpoint.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
