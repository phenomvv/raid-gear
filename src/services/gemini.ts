import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult, ContentStrategy, Stats, Champion } from '../types';

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      console.error('Gemini API Key is missing or invalid. Please check your environment variables.');
      throw new Error('GEMINI_API_KEY is not defined. Please set it in your environment variables.');
    }
    
    try {
      aiInstance = new GoogleGenAI({ apiKey });
    } catch (error) {
      console.error('Failed to initialize GoogleGenAI:', error);
      throw error;
    }
  }
  return aiInstance;
}

// Simple in-memory cache to reduce redundant API calls and data usage
const cache = new Map<string, any>();

function getCacheKey(prefix: string, data: any): string {
  return `${prefix}:${JSON.stringify(data)}`;
}

const TEAM_OPTIMIZATION_RUBRIC = `Expert Raid: Shadow Legends strategist. Optimize team stats for specific content (Clan Boss, Hydra, etc.).
Evaluate current stats vs benchmarks. Provide target stats, actionable advice, and priority (HIGH/MEDIUM/LOW).
Consider: ACC exceptions (cannot be resisted), passive stat boosts, and correct primary stat scaling (HP/DEF/ATK).`;

const GEAR_EVALUATION_RUBRIC = `Expert Raid: Shadow Legends gear evaluator.
SYNERGY: Nuker (ATK/CR/CD/SPD), Tank (HP/DEF/SPD/RES/ACC), Debuffer (ACC/SPD/HP/DEF).
ACCESSORIES: Rings, Amulets, and Banners are FACTION LOCKED. You MUST check the item's faction and only recommend champions from that specific faction. If no roster champions match the faction, suggest general archetypes for that faction.
SELL: Flat main stats on Gloves/Chest/Boots (except SPD boots). 4* or lower. 3+ flat subs at +0.
SCORING: 0-100. Consider multi-rolls (Triple/Quad), set synergy, and rework potential (Chaos Ore for flat triple/quads on 6* Leg/Myth).
ADVICE: Glyphs, Chaos Ore, or Oil ascension.
VERDICT: Strictly 'KEEP' or 'SELL'.`;

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
    ? roster.slice(0, 50).join(', ') + (roster.length > 50 ? '...' : '')
    : 'No champions in roster. Suggest general champion archetypes.';

  const prompt = `Evaluate gear: ${gearDetails.type}, ${gearDetails.set}, ${gearDetails.rank}, ${gearDetails.rarity}, +${gearDetails.level || 0}, Main: ${gearDetails.mainStat}, Subs: ${gearDetails.substats.join(', ')}. Roster: ${rosterText}. Return JSON. Verdict: KEEP/SELL. Limit recommendations to top 3 champions.`;

  try {
    const response = await getAI().models.generateContent({
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
      throw new Error('The AI model returned an empty response.');
    }

    const result = JSON.parse(text) as AnalysisResult;
    cache.set(cacheKey, result);
    return result;
  } catch (error: any) {
    console.error('Error in evaluateManualGear:', error);
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Invalid API Key. Please check your configuration.');
    }
    throw error;
  }
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

  const prompt = `Target: ${contentName}. Team: ${JSON.stringify(teamData)}. Return JSON.`;

  const response = await getAI().models.generateContent({
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
