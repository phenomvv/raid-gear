import { Stats, GearItem } from '../types';

export const DEFAULT_BASE_STATS: Stats = {
  HP: 15000,
  ATK: 1200,
  DEF: 1000,
  SPD: 100,
  C_RATE: 15,
  C_DMG: 50,
  RES: 30,
  ACC: 0
};

export const parseStat = (statStr: string): { type: string, value: number, isPercent: boolean } => {
  const match = statStr.match(/^([A-Z._%]+)\s+(\d+)(%?)$/i);
  if (!match) return { type: '', value: 0, isPercent: false };
  
  let type = match[1].toUpperCase();
  const value = parseInt(match[2]);
  const isPercent = match[3] === '%' || type.includes('%');
  
  // Normalize type
  if (type.includes('HP')) type = 'HP';
  if (type.includes('ATK')) type = 'ATK';
  if (type.includes('DEF')) type = 'DEF';
  if (type.includes('SPD')) type = 'SPD';
  if (type.includes('C.RATE') || type.includes('CRIT RATE')) type = 'C_RATE';
  if (type.includes('C.DMG') || type.includes('CRIT DMG')) type = 'C_DMG';
  if (type.includes('RES')) type = 'RES';
  if (type.includes('ACC')) type = 'ACC';

  return { type, value, isPercent };
};

export const calculateTotalStats = (baseStats: Stats, equippedGear: GearItem[]) => {
  const totals: Stats = { ...baseStats };
  const bonus: Stats = { HP: 0, ATK: 0, DEF: 0, SPD: 0, C_RATE: 0, C_DMG: 0, RES: 0, ACC: 0 };

  equippedGear.forEach(item => {
    const statsToProcess = [
      item.gearDetails.mainStat,
      ...item.gearDetails.substats,
      item.gearDetails.ascensionStat
    ].filter(Boolean) as string[];

    statsToProcess.forEach((s, idx) => {
      const { type, value, isPercent } = parseStat(s);
      if (!type || !(type in bonus)) return;

      const statKey = type as keyof Stats;
      let finalValue = value;

      // Add enchant if it's a substat
      if (idx >= 1 && idx <= item.gearDetails.substats.length) {
        const enchant = item.gearDetails.substatEnchants?.[idx - 1] || 0;
        finalValue += enchant;
      }

      if (isPercent && (statKey === 'HP' || statKey === 'ATK' || statKey === 'DEF')) {
        bonus[statKey] += Math.floor(baseStats[statKey] * (finalValue / 100));
      } else {
        bonus[statKey] += finalValue;
      }
    });
  });

  Object.keys(totals).forEach(key => {
    const k = key as keyof Stats;
    totals[k] += bonus[k];
  });

  return { totals, bonus };
};
