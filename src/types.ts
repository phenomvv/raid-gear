export interface Champion {
  id: string;
  name: string;
}

export interface GearDetails {
  set: string;
  rank: string;
  rarity: string;
  mainStat: string;
  substats: string[];
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

export interface AnalysisResult {
  gearDetails: GearDetails;
  evaluation: Evaluation;
  recommendations: Recommendation[];
}

export interface GearItem extends AnalysisResult {
  id: string;
  dateAdded: string;
  image?: string;
}
