import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult, ContentStrategy, Stats, Champion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Simple in-memory cache to reduce redundant API calls and data usage
const cache = new Map<string, any>();

function getCacheKey(prefix: string, data: any): string {
  return `${prefix}:${JSON.stringify(data)}`;
}

const TEAM_OPTIMIZATION_RUBRIC = `
You are a world-class Raid: Shadow Legends strategist. Your goal is to help players optimize their champion teams for specific game content.
Content examples: Clan Boss (UNM/NM), Hydra (Normal/Hard/Brutal/Nightmare), Doom Tower, Iron Twins, Sand Devil, Shogun, Arena.

CRITICAL KIT KNOWLEDGE:
1. ACCURACY EXCEPTIONS: Some champions have skills that "Cannot be Resisted" (e.g., Thor Fafnir's Bane A1 Decrease ATK, Lydia's A2). DO NOT recommend Accuracy for these specific debuffs.
2. PASSIVE SYNERGIES: Account for passives that grant stats (e.g., Gnut's DEF scaling, Michinaki's HP/DEF conversion).
3. MULTI-STAT SCALING: Identify if a champion scales with HP, DEF, or ATK and prioritize the correct primary stat.

For each champion in the team:
1. Compare their CURRENT stats to the RECOMMENDED benchmarks for the target content.
2. Provide specific TARGET stats they should aim for.
3. Give actionable ADVICE on what to change.
4. Assign a PRIORITY (HIGH, MEDIUM, LOW).
`;

const GEAR_EVALUATION_RUBRIC = `
You are a top-tier Raid: Shadow Legends theorycrafter. Your goal is to provide 100% consistent gear evaluations.
Follow this strict protocol:

1. STAT SYNERGY GROUPS:
   - NUKER: ATK%, Crit Rate, Crit DMG, Speed.
   - TANK/SUPPORT: HP%, DEF%, Speed, Resistance, Accuracy.
   - DEBUFFER: Accuracy, Speed, HP%, DEF%.

2. AUTOMATIC SELL RULES:
   - Gloves, Chest, or Boots with FLAT main stats (ATK, DEF, HP) are ALWAYS "SELL" (except Speed boots).
   - 4-star gear or lower is ALWAYS "SELL" for mid-game players.
   - Gear with 3+ flat substats (ATK, DEF, HP) at +0 is almost always "SELL".

3. ROLLS & UPGRADES:
   - MULTI-ROLLS: Double (2), Triple (3), and Quad (4) rolls in a single substat significantly increase the score.
   - ROLL LIMIT: A gear piece can only have a total of 4 rolls across all substats (e.g., a triple roll in one stat and a single roll in another).
   - DESIRABLE MULTI-ROLLS: Triple/Quad rolls in Speed, Crit Rate, Crit DMG, HP%, DEF%, ATK%, Accuracy, or Resistance are extremely valuable (Score 85+).
   - REWORK VALUE: Triple/Quad rolls in "bad" stats (Flat HP/ATK/DEF) on 6-star Legendary/Mythical gear are worth keeping (Score 70+) because they can be REWORKED with Chaos Ore.
   - UPGRADE LEVEL: A piece at +16 with confirmed good rolls is more valuable than a +0 piece with "potential".

4. KEEP CRITERIA:
   - 6-star Legendary/Mythical with at least 2 synergistic substats.
   - Any gear with a high Speed substat (10+ at +0, or any multi-roll).
   - 5-star Epic/Legendary with perfect synergy (e.g., Savage set with Crit Rate and Crit DMG).
   - ACCESSORIES: Must be for a relevant faction and have synergistic stats.

5. SCORING SCALE:
   - 0-40: Trash, sell immediately.
   - 41-60: Mediocre, keep only if early game or desperate for the set.
   - 61-80: Good, solid for most champions.
   - 81-100: God-tier, perfect rolls and synergy.

6. ENHANCEMENT ADVICE:
   - ENCHANT: Recommend which substats to use Glyphs on.
   - REWORK: Advise if the piece is a candidate for Chaos Ore (especially if it has a triple/quad roll in a flat stat).
   - ASCEND: Advise if the piece is worth Oil ascension.
`;

export async function analyzeGear(
  imageBase64: string,
  mimeType: string,
  roster: string[]
): Promise<AnalysisResult> {
  const cacheKey = getCacheKey('analyzeGear', { imageBase64: imageBase64.substring(0, 1000), roster });
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const rosterText = roster.length > 0 
    ? roster.join(', ') 
    : 'No champions in roster. Suggest general champion archetypes.';

  const prompt = `Analyze this Raid: Shadow Legends gear screenshot.
  
  User Roster: ${rosterText}

  Return the analysis in JSON format following the schema. Ensure the 'verdict' is strictly 'KEEP' or 'SELL' based on the provided rubric.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
      { text: prompt },
    ],
    config: {
      systemInstruction: GEAR_EVALUATION_RUBRIC,
      temperature: 0,
      seed: 42,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          gearDetails: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              set: { type: Type.STRING },
              faction: { type: Type.STRING, description: "Optional: Faction for accessories" },
              rank: { type: Type.STRING },
              rarity: { type: Type.STRING },
              level: { type: Type.NUMBER, description: "The upgrade level (0, 4, 8, 12, 16)" },
              mainStat: { type: Type.STRING },
              substats: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['type', 'set', 'rank', 'rarity', 'mainStat', 'substats'],
          },
          evaluation: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              verdict: { type: Type.STRING, description: "Must be 'KEEP' or 'SELL'" },
              reasoning: { type: Type.STRING },
            },
            required: ['score', 'verdict', 'reasoning'],
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                champion: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ['champion', 'reason'],
            },
          },
          enhancements: {
            type: Type.OBJECT,
            properties: {
              enchant: { type: Type.STRING },
              rework: { type: Type.STRING },
              ascend: { type: Type.STRING },
            },
            required: ['enchant', 'rework', 'ascend'],
          },
        },
        required: ['gearDetails', 'evaluation', 'recommendations', 'enhancements'],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Failed to generate analysis');
  }

  const result = JSON.parse(text) as AnalysisResult;
  cache.set(cacheKey, result);
  return result;
}

export async function evaluateManualGear(
  gearDetails: {
    type: string;
    set: string;
    faction?: string;
    rank: string;
    rarity: string;
    level?: number;
    mainStat: string;
    substats: string[];
    ascensionStat?: string;
  },
  roster: string[]
): Promise<AnalysisResult> {
  const cacheKey = getCacheKey('evaluateManualGear', { gearDetails, roster });
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const rosterText = roster.length > 0 
    ? roster.join(', ') 
    : 'No champions in roster. Suggest general champion archetypes.';

  const prompt = `Evaluate this Raid: Shadow Legends gear piece based on the provided details.
  
  Gear Details:
  - Type: ${gearDetails.type}
  - Set: ${gearDetails.set}
  ${gearDetails.faction ? `- Faction: ${gearDetails.faction}` : ''}
  - Rank: ${gearDetails.rank}
  - Rarity: ${gearDetails.rarity}
  - Level: +${gearDetails.level || 0}
  - Main Stat: ${gearDetails.mainStat}
  - Substats: ${gearDetails.substats.join(', ')}
  ${gearDetails.ascensionStat ? `- Ascension Stat: ${gearDetails.ascensionStat}` : ''}

  User Roster: ${rosterText}

  Return the evaluation in JSON format following the schema. Ensure the 'verdict' is strictly 'KEEP' or 'SELL' based on the provided rubric.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      systemInstruction: GEAR_EVALUATION_RUBRIC,
      temperature: 0,
      seed: 42,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          gearDetails: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              set: { type: Type.STRING },
              faction: { type: Type.STRING, description: "Optional: Faction for accessories" },
              rank: { type: Type.STRING },
              rarity: { type: Type.STRING },
              level: { type: Type.NUMBER, description: "The upgrade level (0, 4, 8, 12, 16)" },
              mainStat: { type: Type.STRING },
              substats: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['type', 'set', 'rank', 'rarity', 'mainStat', 'substats'],
          },
          evaluation: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              verdict: { type: Type.STRING, description: "Must be 'KEEP' or 'SELL'" },
              reasoning: { type: Type.STRING },
            },
            required: ['score', 'verdict', 'reasoning'],
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                champion: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ['champion', 'reason'],
            },
          },
          enhancements: {
            type: Type.OBJECT,
            properties: {
              enchant: { type: Type.STRING },
              rework: { type: Type.STRING },
              ascend: { type: Type.STRING },
            },
            required: ['enchant', 'rework', 'ascend'],
          },
        },
        required: ['gearDetails', 'evaluation', 'recommendations', 'enhancements'],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Failed to generate evaluation');
  }

  const result = JSON.parse(text) as AnalysisResult;
  cache.set(cacheKey, result);
  return result;
}

export async function optimizeTeam(
  contentName: string,
  team: { champion: Champion; totalStats: Stats }[]
): Promise<ContentStrategy> {
  const teamData = team.map(t => ({
    n: t.champion.name,
    id: t.champion.id,
    s: t.totalStats
  }));

  const cacheKey = getCacheKey('optimizeTeam', { contentName, teamData });
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const prompt = `Target: ${contentName}
  Data: ${JSON.stringify(teamData)}

  Analyze this team for the target content. Provide specific stat targets and advice for each champion.
  Return the analysis in JSON format following the schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      systemInstruction: TEAM_OPTIMIZATION_RUBRIC,
      temperature: 0,
      seed: 42,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          contentName: { type: Type.STRING },
          teamSynergyAdvice: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                championId: { type: Type.STRING },
                currentStats: {
                  type: Type.OBJECT,
                  properties: {
                    HP: { type: Type.NUMBER },
                    ATK: { type: Type.NUMBER },
                    DEF: { type: Type.NUMBER },
                    SPD: { type: Type.NUMBER },
                    C_RATE: { type: Type.NUMBER },
                    C_DMG: { type: Type.NUMBER },
                    RES: { type: Type.NUMBER },
                    ACC: { type: Type.NUMBER },
                  },
                },
                targetStats: {
                  type: Type.OBJECT,
                  properties: {
                    HP: { type: Type.NUMBER },
                    ATK: { type: Type.NUMBER },
                    DEF: { type: Type.NUMBER },
                    SPD: { type: Type.NUMBER },
                    C_RATE: { type: Type.NUMBER },
                    C_DMG: { type: Type.NUMBER },
                    RES: { type: Type.NUMBER },
                    ACC: { type: Type.NUMBER },
                  },
                },
                advice: { type: Type.STRING },
                priority: { type: Type.STRING, description: "HIGH, MEDIUM, or LOW" },
              },
              required: ['championId', 'currentStats', 'targetStats', 'advice', 'priority'],
            },
          },
        },
        required: ['contentName', 'teamSynergyAdvice', 'recommendations'],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Failed to generate team optimization');
  }

  const result = JSON.parse(text) as ContentStrategy;
  cache.set(cacheKey, result);
  return result;
}
