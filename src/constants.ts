export const POPULAR_CHAMPIONS = Array.from(new Set([
  // --- BANNER LORDS ---
  "Arbiter", "Septimus", "Baron", "Raglin", "Sethallia", "Lugan the Steadfast", "Minaya", "Richtoff the Bold", "Black Knight", "Helior", "Staltus Dragonbane", "Tarshon", "Ursala the Mourner", "Stag Knight", "Oathbound", "Rowan", "Azure", "Seneschal", "Hordin", "Knight-Errant", "Lordly Legionary", "Archmage Hellmut", "Giscard the Sigilled", "Cillian the Lucky",

  // --- HIGH ELVES ---
  "Lyssandra", "Ithos", "Basileus Kataphron", "Belanor", "Elenaril", "Royal Huntsman", "Shirimani", "Yannica", "Pythion", "Elva Autumnborn", "Tayrel", "Royal Guard", "Vergis", "Thenasil", "Battlesage", "Luthiea", "Jinglehunter", "Hyria", "Apothecary", "Reliquary Tender", "Elhain",

  // --- THE SACRED ORDER ---
  "Cardiel", "Martyr", "Venus", "Cupidus", "Sir Nicholas", "Roshcard the Tower", "Abbeys", "Astralon", "Errol", "Mother Cybele", "Inquisitor Shamael", "Fenax", "Mordecai", "Tallia", "Juliana", "Lightsworn", "Hope", "Mistress of Hymns", "Lodric Falconheart", "Armina", "Athel", "Corvis the Corruptor", "Bivald the Thorn", "Gaius the Gleeful",

  // --- BARBARIANS ---
  "Valkyrie", "Ursuga Warfolk", "Turvold", "Altan", "Scyl of the Drakes", "Skytouched Shaman", "Fahrakin the Fat", "High Khatun", "Warmaiden", "Soulbond Bowyer", "Haarken Greatblade", "Kallia", "Atur", "Sikara", "Valla", "Bar-Idris", "Dunestrider", "Elder Skarg", "Kantra the Cyclone", "Opardin Clanfather",

  // --- OGRYN TRIBES ---
  "Krisk the Ageless", "Big 'Un", "Ignatius", "Ghrush the Mangler", "Gurptuk Moss-Beard", "Korugar Death-Bell", "Uugo", "Maneater", "Occult Brawler", "Skullcrusher", "Shatterbones", "Gorgorab", "Towering Titan", "Warcaster", "Prundar", "Klodd Beastfeeder", "Bellower", "Gomlok Skyhide", "Shamrock",

  // --- LIZARDMEN ---
  "Dracomorph", "Fu-Shan", "Rhazin Scarhide", "Roxam", "Venomage", "Jareg", "Aox the Rememberer", "Broadmaw", "Drake", "Quargan the Crowned", "Basilisk", "Jizoh", "Ramantu Drakesblood", "Nekmo-Thar",

  // --- SKINWALKERS ---
  "Khoronar", "Leorius the Proud", "Longbeard", "Norog", "Ragash", "Brakus the Shifter", "Gnishak Verminlord", "Cleopterix", "Fayne", "Hoforees the Tusked", "Steelskull", "Basher", "Reinbeast", "Ursine Icecrusher", "Ursine Ironhide", "Snorting Thug", "Warchief", "Hakkorhn Smashlord", "Samar Gemcurse",

  // --- ORCS ---
  "Warlord", "Angar", "Iron Brago", "Robar", "Grohak the Bloodied", "Kreela Witch-Arm", "Teumesia", "Artak", "Seer", "Dhukk the Pierced", "Zargala", "Sandlashed Survivor", "Vrask", "Ultimate Galek", "Trumborr", "Old Hermit Jorrg", "Tuhanarak", "Galek", "Gomlok", "Nari the Lucky",

  // --- DEMONSPAWN ---
  "Duchess Lilitu", "Prince Kymar", "Siphi the Lost Bride", "Candraphon", "Countess Lix", "Inithwe Bloodtwin", "Lord Shazar", "Mortu-Macaab", "Sicia Flametongue", "Hephraak", "Alure", "Umbral Enchantress", "Peydma", "Nazana", "Tainix Hateflower", "Achak the Wendarin", "Diabolist", "Fellhound", "Magnarr", "Wythir the Crowned",

  // --- UNDEAD HORDES ---
  "Bad-el-Kazar", "Nethril", "Saito", "Bloodgorged", "Harvest Jack", "Ma'Shalled", "Urost the Soulcage", "Vogoth", "Mausoleum Mage", "Seeker", "Zelotah", "Anax", "Hexia", "Dark Elhain", "Dark Kael", "Frozen Banshee", "Little Miss Annie", "Nogdar the Headhunter",

  // --- DARK ELVES ---
  "Zavia", "Vizier Ovelis", "Rae", "Blind Seer", "Lydia the Deathsiren", "Mithrala Lifebane", "Madame Serris", "Psylar", "Coldheart", "Kaiden", "Fang Cleric", "Spider", "Captain Temila", "Luria", "Kael", "Visix the Unbowed", "Ruel the Huntmaster",

  // --- KNIGHT REVENANT ---
  "Soulless", "Bystophus", "Versulf the Mournful", "Sinesha", "Skullcrown", "Miscreated Monster", "Rector Drath", "Whisper", "Doomscreech", "Sepulcher Sentinel", "Golden Reaper", "Bergoth the Malformed", "Thylessia", "Pharsalas Gravedirt", "Kalvalax",

  // --- DWARVES ---
  "Trunda Giltmallet", "Tormin the Cold", "Maulie Tankard", "Hurndig", "Underpriest Brogni", "Helicath", "Geomancer", "Demytha", "Gala Longids", "Melga Steelgirdle", "Rearguard Sergeant", "Rockbreaker", "Rugnor Goldgleam", "Avir the Alchemage", "Kurzad Deepheart", "Bulwark", "Foli", "Mountain King",

  // --- SHADOWKIN ---
  "Genbo the Dishonored", "Jintoro", "Riho Bonespear", "Karato Foxhunter", "Yumeko", "Kyoku", "Genzin", "Sachi", "Burangiri", "Chani", "Oboro", "Kunoichi", "Fanatic", "Nobel",

  // --- SYLVAN WATCHERS ---
  "Ruarc Guardian", "Razelvarg", "Jetni the Giant", "Emic Trunkheart", "Gnut", "Duedan the Runic", "Wyllir the Wall", "Kellan the Shrike", "Enda Moonbeam", "Criodan the Blue", "Odaachi",

  // --- COLLABORATIONS & SPECIAL ---
  "Ninja", "Ronda", "Aleksandr the Sharpshooter", "Ultimate Deathknight", "UDK", "Sun Wukong", "Rathalos Blademaster", "Zinogre Blademaster", "Nergigante Archer", "Alatreon Blademaster", "Fatalis Fate", "Armanz the Magnificent", "Adelyn", "Eolfrig", "Xena: Warrior Princess", "Ezio Auditore", "Thor Faehammer", "Loki the Deceiver", "Odin Faefather", "Freyja Fateweaver", "Tholin Foulbeard", "Diamant", "Vixwell the Repugnant", "Packmaster Shy'ek", "Wixwell", "Gizmak the Terrible", "Narses the Necromancer", "Ankora the Sharp", "Wallmaster Othorion", "Vault Keeper Wixwell", "Xenomorph", "Predator"
]));

export const RAID_STATS = [
  "SPD", "ATK%", "ATK", "DEF%", "DEF", "HP%", "HP", "C.RATE", "C.DMG", "ACC", "RES"
];

export const GEAR_TYPES = [
  "Weapon", "Helmet", "Shield", "Gauntlets", "Chestplate", "Boots", "Ring", "Amulet", "Banner"
];

export const RAID_SETS = Array.from(new Set([
  "Accuracy", "Affinitybreaker", "Avenging", "Bloodshield", "Bloodthirst", "Bolster",
  "Critical Damage", "Critical Rate", "Cruel", "Curing", "Cursed", "Daze", "Defense",
  "Defiant", "Deflection", "Destroy", "Divine Critical Rate", "Divine Defense",
  "Divine Life", "Divine Offense", "Fatal", "Fortitude", "Frenzy", "Frost", "Frostbite",
  "Fury", "Guardian", "Immortal", "Immunity", "Impulse", "Instinct", "Killstroke",
  "Lethal", "Life", "Lifesteal", "Merciless", "Offense", "Perception", "Protection",
  "Provoke", "Reflex", "Regeneration", "Relentless", "Resistance", "Resilience",
  "Retaliation", "Righteous", "Savage", "Shield", "Slayer", "Speed", "Stalwart",
  "Stoneskin", "Stun", "Supersonic", "Swift Parry", "Taunting", "Toxic", "Untouchable",
  "Vampiric", "Zeal"
])).sort();


