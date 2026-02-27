import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
   - Gear with 3+ flat substats (ATK, DEF, HP) is almost always "SELL".

3. KEEP CRITERIA:
   - 6-star Legendary/Mythical with at least 2 synergistic substats.
   - Any gear with a high Speed substat (10+).
   - 5-star Epic/Legendary with perfect synergy (e.g., Savage set with Crit Rate and Crit DMG).

4. SCORING SCALE:
   - 0-40: Trash, sell immediately.
   - 41-60: Mediocre, keep only if early game or desperate for the set.
   - 61-80: Good, solid for most champions.
   - 81-100: God-tier, perfect rolls and synergy.
`;

export async function analyzeGear(
  imageBase64: string,
  mimeType: string,
  roster: string[]
): Promise<AnalysisResult> {
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
      prompt,
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
              set: { type: Type.STRING },
              rank: { type: Type.STRING },
              rarity: { type: Type.STRING },
              mainStat: { type: Type.STRING },
              substats: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['set', 'rank', 'rarity', 'mainStat', 'substats'],
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
        },
        required: ['gearDetails', 'evaluation', 'recommendations'],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Failed to generate analysis');
  }

  return JSON.parse(text) as AnalysisResult;
}

export async function evaluateManualGear(
  gearDetails: {
    type: string;
    set: string;
    rank: string;
    rarity: string;
    mainStat: string;
    substats: string[];
  },
  roster: string[]
): Promise<AnalysisResult> {
  const rosterText = roster.length > 0 
    ? roster.join(', ') 
    : 'No champions in roster. Suggest general champion archetypes.';

  const prompt = `Evaluate this Raid: Shadow Legends gear piece based on the provided details.
  
  Gear Details:
  - Type: ${gearDetails.type}
  - Set: ${gearDetails.set}
  - Rank: ${gearDetails.rank}
  - Rarity: ${gearDetails.rarity}
  - Main Stat: ${gearDetails.mainStat}
  - Substats: ${gearDetails.substats.join(', ')}

  User Roster: ${rosterText}

  Return the evaluation in JSON format following the schema. Ensure the 'verdict' is strictly 'KEEP' or 'SELL' based on the provided rubric.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
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
              set: { type: Type.STRING },
              rank: { type: Type.STRING },
              rarity: { type: Type.STRING },
              mainStat: { type: Type.STRING },
              substats: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['set', 'rank', 'rarity', 'mainStat', 'substats'],
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
        },
        required: ['gearDetails', 'evaluation', 'recommendations'],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Failed to generate evaluation');
  }

  return JSON.parse(text) as AnalysisResult;
}
