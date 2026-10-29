/* UNMASKED — catalog. Every costume is a villain the gang unmasked. */
(function(){
const M = window.UM = window.UM || {};
M.cats = { ghosts:'01 · Ghosts', ghouls:'02 · Ghouls', gameover:'03 · Game Over', gang:'04 · The Gang' };
M.products = [
  { id:'phantom', name:'Phantom Sheet', cat:'ghosts', price:49, badge:'Case #001',
    desc:'Double-layer spectral linen over a feather-light hood frame. Glows under blacklight and swishes like it means it.',
    culprit:'A real-estate agent scaring buyers off a "haunted" lot so she could buy it cheap.' },
  { id:'miner', name:'Miner 49 Ghost', cat:'ghosts', price:69, badge:'Glow kit',
    desc:'Phosphor-green ghost hood, a working LED miner lamp and a flowing beard of pure ectoplasm (polyester).',
    culprit:'The town banker, digging for gold under the old mine at night.' },
  { id:'witch', name:'Swamp Witch Hat', cat:'ghosts', price:35, badge:'Hand-bent',
    desc:'Crooked felt cone, pumpkin-orange band, brass buckle and a firefly that refuses to leave.',
    culprit:'The town librarian. The overdue fines were getting out of hand.' },
  { id:'jack', name:"Jack-o'-Creeper", cat:'ghouls', price:39, badge:'Lights up',
    desc:'Carved foam pumpkin head with a warm candle-flicker LED and a burlap scarecrow collar.',
    culprit:'The farmer next door, trying to win the giant-pumpkin contest by scaring off the judges.' },
  { id:'count', name:'Count Velvet Cape', cat:'ghouls', price:79, badge:'Best seller',
    desc:'Ten-foot opera cape, blood-red satin lining, a collar that stands up by itself and a ruby medallion.',
    culprit:'The theatre owner, keeping everyone away from the stolen paintings in the attic.' },
  { id:'mummy', name:'Mummy Wrap Set', cat:'ghouls', price:59, badge:'Pre-aged',
    desc:'30 metres of tea-stained cotton wraps, glowing eye lenses and an extra loose strip for dramatic trailing.',
    culprit:'The museum curator, who "borrowed" the pharaoh\'s gold.' },
  { id:'cosmic', name:'Cosmic Skull Spaceman', cat:'ghouls', price:89, badge:'Out of this world',
    desc:'Retro fishbowl helmet with a grinning skull inside, purple eye lights and an antenna that blinks.',
    culprit:'A movie stuntman faking a UFO landing for publicity.' },
  { id:'pyramid', name:'Red Pyramid Helm', cat:'gameover', price:149, badge:'Fog-town homage',
    desc:'Oversized riveted helmet in rust-finish foam. Comes with a very heavy-looking (very light) great-knife prop.',
    culprit:'A misunderstood blacksmith. He just wanted someone to talk to.' },
  { id:'pursuer', name:'The Pursuer Mask', cat:'gameover', price:129, badge:'Survival-horror homage',
    desc:'Stitched latex head, exposed-teeth grin, single glowing eye and a black trench collar that rustles menacingly.',
    culprit:'A courier who takes "guaranteed delivery" way too seriously.' },
  { id:'nurse', name:'Fog Town Nurse', cat:'gameover', price:99, badge:'Homage',
    desc:'Bandage-wrapped head form, starched cap with red cross and a vintage collar. Twitching sold separately.',
    culprit:'The night-shift receptionist. She hates visitors.' },
  { id:'dane', name:'Biscuit Dane Hood', cat:'gang', price:59, badge:'Ruh-oh!',
    desc:'Plush Great Dane hood with floppy ears, a teal collar and a golden tag. Biscuits not included (find them in the house).',
    culprit:'Nobody — it\'s just Biscuit. He\'s always just Biscuit.' },
  { id:'kit', name:'Meddling Kids Kit', cat:'gang', price:45, badge:'Squad pack',
    desc:'Thick-frame glasses, an orange ascot, a purple headband and a brass magnifying glass. Solve mysteries in style.',
    culprit:'You. You are the meddling kids now.' }
];
M.byId = id => M.products.find(p=>p.id===id);
})();
