export interface ChampionData {
  name: string;
  faction: string;
}

export const POPULAR_CHAMPIONS: ChampionData[] = [
  // --- BANNER LORDS ---
  ...["Arbiter", "Septimus", "Baron", "Raglin", "Sethallia", "Lugan the Steadfast", "Minaya", "Richtoff the Bold", "Black Knight", "Helior", "Staltus Dragonbane", "Tarshon", "Ursala the Mourner", "Stag Knight", "Oathbound", "Rowan", "Azure", "Seneschal", "Hordin", "Knight-Errant", "Lordly Legionary", "Archmage Hellmut", "Giscard the Sigilled", "Cillian the Lucky"].map(name => ({ name, faction: "Banner Lords" })),

  // --- HIGH ELVES ---
  ...["Lyssandra", "Ithos", "Basileus Kataphron", "Belanor", "Elenaril", "Royal Huntsman", "Shirimani", "Yannica", "Pythion", "Elva Autumnborn", "Tayrel", "Royal Guard", "Vergis", "Thenasil", "Battlesage", "Luthiea", "Jinglehunter", "Hyria", "Apothecary", "Reliquary Tender", "Elhain"].map(name => ({ name, faction: "High Elves" })),

  // --- THE SACRED ORDER ---
  ...["Cardiel", "Martyr", "Venus", "Cupidus", "Sir Nicholas", "Roshcard the Tower", "Abbeys", "Astralon", "Errol", "Mother Cybele", "Inquisitor Shamael", "Fenax", "Mordecai", "Tallia", "Juliana", "Lightsworn", "Hope", "Mistress of Hymns", "Lodric Falconheart", "Armina", "Athel", "Corvis the Corruptor", "Bivald the Thorn", "Gaius the Gleeful"].map(name => ({ name, faction: "The Sacred Order" })),

  // --- BARBARIANS ---
  ...["Valkyrie", "Ursuga Warfolk", "Turvold", "Altan", "Scyl of the Drakes", "Skytouched Shaman", "Fahrakin the Fat", "High Khatun", "Warmaiden", "Soulbond Bowyer", "Haarken Greatblade", "Kallia", "Atur", "Sikara", "Valla", "Bar-Idris", "Dunestrider", "Elder Skarg", "Kantra the Cyclone", "Opardin Clanfather"].map(name => ({ name, faction: "Barbarians" })),

  // --- OGRYN TRIBES ---
  ...["Krisk the Ageless", "Big 'Un", "Ignatius", "Ghrush the Mangler", "Gurptuk Moss-Beard", "Korugar Death-Bell", "Uugo", "Maneater", "Occult Brawler", "Skullcrusher", "Shatterbones", "Gorgorab", "Towering Titan", "Warcaster", "Prundar", "Klodd Beastfeeder", "Bellower", "Gomlok Skyhide", "Shamrock"].map(name => ({ name, faction: "Ogryn Tribes" })),

  // --- LIZARDMEN ---
  ...["Dracomorph", "Fu-Shan", "Rhazin Scarhide", "Roxam", "Venomage", "Jareg", "Aox the Rememberer", "Broadmaw", "Drake", "Quargan the Crowned", "Basilisk", "Jizoh", "Ramantu Drakesblood", "Nekmo-Thar"].map(name => ({ name, faction: "Lizardmen" })),

  // --- SKINWALKERS ---
  ...["Khoronar", "Leorius the Proud", "Longbeard", "Norog", "Ragash", "Brakus the Shifter", "Gnishak Verminlord", "Cleopterix", "Fayne", "Hoforees the Tusked", "Steelskull", "Basher", "Reinbeast", "Ursine Icecrusher", "Ursine Ironhide", "Snorting Thug", "Warchief", "Hakkorhn Smashlord", "Samar Gemcurse"].map(name => ({ name, faction: "Skinwalkers" })),

  // --- ORCS ---
  ...["Warlord", "Angar", "Iron Brago", "Robar", "Grohak the Bloodied", "Kreela Witch-Arm", "Teumesia", "Artak", "Seer", "Dhukk the Pierced", "Zargala", "Sandlashed Survivor", "Vrask", "Ultimate Galek", "Trumborr", "Old Hermit Jorrg", "Tuhanarak", "Galek", "Gomlok", "Nari the Lucky"].map(name => ({ name, faction: "Orcs" })),

  // --- DEMONSPAWN ---
  ...["Duchess Lilitu", "Prince Kymar", "Siphi the Lost Bride", "Candraphon", "Countess Lix", "Inithwe Bloodtwin", "Lord Shazar", "Mortu-Macaab", "Sicia Flametongue", "Hephraak", "Alure", "Umbral Enchantress", "Peydma", "Nazana", "Tainix Hateflower", "Achak the Wendarin", "Diabolist", "Fellhound", "Magnarr", "Wythir the Crowned", "Tyrant Ixlimor"].map(name => ({ name, faction: "Demonspawn" })),

  // --- UNDEAD HORDES ---
  ...["Bad-el-Kazar", "Nethril", "Saito", "Bloodgorged", "Harvest Jack", "Ma'Shalled", "Urost the Soulcage", "Vogoth", "Mausoleum Mage", "Seeker", "Zelotah", "Anax", "Hexia", "Dark Elhain", "Dark Kael", "Frozen Banshee", "Little Miss Annie", "Nogdar the Headhunter"].map(name => ({ name, faction: "Undead Hordes" })),

  // --- DARK ELVES ---
  ...["Zavia", "Vizier Ovelis", "Rae", "Blind Seer", "Lydia the Deathsiren", "Mithrala Lifebane", "Madame Serris", "Psylar", "Coldheart", "Kaiden", "Fang Cleric", "Spider", "Captain Temila", "Luria", "Kael", "Visix the Unbowed", "Ruel the Huntmaster"].map(name => ({ name, faction: "Dark Elves" })),

  // --- KNIGHT REVENANT ---
  ...["Soulless", "Bystophus", "Versulf the Mournful", "Sinesha", "Skullcrown", "Miscreated Monster", "Rector Drath", "Whisper", "Doomscreech", "Sepulcher Sentinel", "Golden Reaper", "Bergoth the Malformed", "Thylessia", "Pharsalas Gravedirt", "Kalvalax"].map(name => ({ name, faction: "Knight Revenant" })),

  // --- DWARVES ---
  ...["Trunda Giltmallet", "Tormin the Cold", "Maulie Tankard", "Hurndig", "Underpriest Brogni", "Helicath", "Geomancer", "Demytha", "Gala Longids", "Melga Steelgirdle", "Rearguard Sergeant", "Rockbreaker", "Rugnor Goldgleam", "Avir the Alchemage", "Kurzad Deepheart", "Bulwark", "Foli", "Mountain King", "Tholin Foulbeard"].map(name => ({ name, faction: "Dwarves" })),

  // --- SHADOWKIN ---
  ...["Genbo the Dishonored", "Jintoro", "Riho Bonespear", "Karato Foxhunter", "Yumeko", "Kyoku", "Genzin", "Sachi", "Burangiri", "Chani", "Oboro", "Kunoichi", "Fanatic", "Nobel"].map(name => ({ name, faction: "Shadowkin" })),

  // --- SYLVAN WATCHERS ---
  ...["Ruarc Guardian", "Razelvarg", "Jetni the Giant", "Emic Trunkheart", "Gnut", "Duedan the Runic", "Wyllir the Wall", "Kellan the Shrike", "Enda Moonbeam", "Criodan the Blue", "Odaachi"].map(name => ({ name, faction: "Sylvan Watchers" })),

  // --- COLLABORATIONS & SPECIAL ---
  ...["Ronda"].map(name => ({ name, faction: "Banner Lords" })),
  ...["Ezio Auditore"].map(name => ({ name, faction: "The Sacred Order" })),
  ...["Ultimate Deathknight", "UDK"].map(name => ({ name, faction: "Undead Hordes" })),
  ...["Sun Wukong"].map(name => ({ name, faction: "Skinwalkers" })),
  ...["Ninja", "Loki the Deceiver"].map(name => ({ name, faction: "Shadowkin" })),
  ...["Rathalos Blademaster", "Zinogre Blademaster", "Nergigante Archer", "Alatreon Blademaster", "Fatalis Fate", "Thor Faehammer", "Odin Faefather", "Freyja Fateweaver"].map(name => ({ name, faction: "Barbarians" })),
  ...["Aleksandr the Sharpshooter"].map(name => ({ name, faction: "High Elves" })),
  ...["Xena: Warrior Princess"].map(name => ({ name, faction: "Barbarians" })),
  ...["Armanz the Magnificent"].map(name => ({ name, faction: "Barbarians" })),
  ...["Adelyn"].map(name => ({ name, faction: "Shadowkin" })),
  ...["Eolfrig"].map(name => ({ name, faction: "Banner Lords" })),
  ...["Diamant"].map(name => ({ name, faction: "Dwarves" })),
  ...["Vixwell the Repugnant", "Wixwell", "Vault Keeper Wixwell"].map(name => ({ name, faction: "Shadowkin" })),
  ...["Packmaster Shy'ek"].map(name => ({ name, faction: "Skinwalkers" })),
  ...["Gizmak the Terrible"].map(name => ({ name, faction: "Orcs" })),
  ...["Narses the Necromancer"].map(name => ({ name, faction: "Undead Hordes" })),
  ...["Ankora the Sharp"].map(name => ({ name, faction: "Undead Hordes" })),
  ...["Wallmaster Othorion"].map(name => ({ name, faction: "High Elves" })),
  ...["Xenomorph"].map(name => ({ name, faction: "Dark Elves" })),
  ...["Predator"].map(name => ({ name, faction: "Lizardmen" }))
];

export const RAID_STATS = [
  "SPD", "ATK%", "ATK", "DEF%", "DEF", "HP%", "HP", "C.RATE", "C.DMG", "ACC", "RES"
];

export const FACTIONS = [
  "Banner Lords", "High Elves", "The Sacred Order", "Barbarians", "Ogryn Tribes", 
  "Lizardmen", "Skinwalkers", "Orcs", "Demonspawn", "Undead Hordes", 
  "Dark Elves", "Knight Revenant", "Dwarves", "Shadowkin", "Sylvan Watchers"
];

export const GEAR_TYPES = [
  "Weapon", "Helmet", "Shield", "Gauntlets", "Chestplate", "Boots", "Ring", "Amulet", "Banner"
];

export const RAID_SETS = Array.from(new Set([
  "Accuracy", "Affinitybreaker", "Avenging", "Bloodshield", "Bloodthirst", "Bolster",
  "Chronophage", "Critical Damage", "Critical Rate", "Cruel", "Curing", "Cursed", "Daze", "Defense",
  "Defiant", "Deflection", "Destroy", "Divine Critical Rate", "Divine Defense",
  "Divine Life", "Divine Offense", "Fatal", "Fortitude", "Frenzy", "Frost", "Frostbite",
  "Fury", "Guardian", "Immortal", "Immunity", "Impulse", "Instinct", "Killstroke",
  "Lethal", "Life", "Lifesteal", "Merciless", "Offense", "Perception", "Protection",
  "Provoke", "Reflex", "Regeneration", "Relentless", "Resistance", "Resilience",
  "Retaliation", "Righteous", "Savage", "Shield", "Slayer", "Speed", "Stalwart",
  "Stoneskin", "Stun", "Supersonic", "Swift Parry", "Taunting", "Toxic", "Untouchable",
  "Vampiric", "Zeal"
])).sort();

export const ACCESSORY_SETS = [
  "Standard", "Chronophage", "Feral", "Slayer", "Merciless"
];


