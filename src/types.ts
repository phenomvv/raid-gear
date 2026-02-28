export interface Stats {
  HP: number;
  ATK: number;
  DEF: number;
  SPD: number;
  C_RATE: number;
  C_DMG: number;
  RES: number;
  ACC: number;
}

export interface Champion {
  id: string;
  name: string;
  faction?: string;
  baseStats?: Stats;
}

export interface GearDetails {
  type: string;
  set: string;
  faction?: string;
  rank: string;
  rarity: string;
  level?: number;
  mainStat: string;
  substats: string[];
  substatEnchants?: number[]; // Optional enchant values for each substat
  ascensionStat?: string;
}

export interface Recommendation {
  champion: string;
  reason: string;
}

export interface Evaluation {
  score: number;
  verdict: 'KEEP' | 'SELL';
  reasoning: string;
}

export interface EnhancementAdvice {
  enchant: string;
  rework: string;
  ascend: string;
}

export interface AnalysisResult {
  gearDetails: GearDetails;
  evaluation: Evaluation;
  recommendations: Recommendation[];
  enhancements?: EnhancementAdvice;
}

export interface GearItem extends AnalysisResult {
  id: string;
  dateAdded: string;
  image?: string;
  equippedTo?: string; // Champion ID
}

export interface TeamOptimizationResult {
  championId: string;
  currentStats: Stats;
  targetStats: Partial<Stats>;
  advice: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ContentStrategy {
  contentName: string;
  recommendations: TeamOptimizationResult[];
  teamSynergyAdvice: string;
}
