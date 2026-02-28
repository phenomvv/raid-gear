import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Send, Info, ChevronDown, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RAID_STATS, RAID_SETS, GEAR_TYPES, FACTIONS, ACCESSORY_SETS } from '../constants';
import { useMemo } from 'react';

interface ManualGearFormProps {
  onSubmit: (details: {
    type: string;
    set: string;
    faction?: string;
    rank: string;
    rarity: string;
    level: number;
    mainStat: string;
    substats: string[];
    substatEnchants?: number[];
    ascensionStat?: string;
  }) => void;
  isAnalyzing: boolean;
  initialData?: any;
  submitLabel?: string;
  gearType?: string; // Add gearType to props if needed, but we use local state
}

interface SubstatRowProps {
  type: string;
  value: string;
  enchant: string;
  rolls: number;
  maxRolls: number;
  onTypeChange: (type: string) => void;
  onValueChange: (val: string) => void;
  onEnchantChange: (val: string) => void;
  onRollsChange: (val: number) => void;
  index: number;
  allowedStats: string[];
  key?: React.Key;
}

function SubstatRow({ 
  type, 
  value, 
  enchant,
  rolls,
  maxRolls,
  onTypeChange, 
  onValueChange,
  onEnchantChange,
  onRollsChange,
  index,
  allowedStats
}: SubstatRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative flex items-center bg-zinc-950 border border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all ${isOpen ? 'z-30' : 'z-10'}`}
    >
      {/* Stat Type Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900 border-r border-zinc-800 hover:bg-zinc-800 transition-colors text-xs font-bold text-indigo-400 min-w-[80px] justify-between rounded-l-xl"
        >
          {type}
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              className="absolute left-0 top-full mt-1 z-50 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1 grid grid-cols-2 gap-1"
            >
              {allowedStats.map((stat) => (
                <button
                  key={stat}
                  type="button"
                  onClick={() => {
                    onTypeChange(stat);
                    setIsOpen(false);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left transition-colors ${
                    type === stat 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {stat}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rolls Selector */}
      <div className="flex items-center bg-zinc-900 border-r border-zinc-800">
        <select
          value={rolls}
          onChange={(e) => onRollsChange(parseInt(e.target.value))}
          className="bg-transparent px-2 py-2.5 text-[10px] font-bold text-zinc-400 focus:outline-none appearance-none cursor-pointer hover:text-zinc-200 transition-colors"
          title="Number of rolls"
        >
          {Array.from({ length: maxRolls + 1 }, (_, i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>

      {/* Value Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="Value"
        className="flex-1 bg-transparent px-4 py-2.5 text-sm text-zinc-100 focus:outline-none placeholder:text-zinc-700 border-r border-zinc-800"
      />

      {/* Enchant Input */}
      <div className={`flex items-center gap-1 px-3 py-2.5 bg-zinc-900/50 rounded-r-xl ${type === 'C.RATE' ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}>
        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
        <input
          type="text"
          value={type === 'C.RATE' ? '' : enchant}
          disabled={type === 'C.RATE'}
          onChange={(e) => onEnchantChange(e.target.value)}
          placeholder={type === 'C.RATE' ? '-' : '0'}
          className="w-8 bg-transparent text-xs text-amber-400 font-bold focus:outline-none placeholder:text-zinc-800 text-center disabled:cursor-not-allowed"
        />
      </div>
    </motion.div>
  );
}

const ALLOWED_MAIN_STATS: Record<string, string[]> = {
  'Weapon': ['ATK'],
  'Helmet': ['HP'],
  'Shield': ['DEF'],
  'Gauntlets': RAID_STATS,
  'Chestplate': RAID_STATS,
  'Boots': RAID_STATS,
  'Ring': ['ATK', 'HP', 'DEF'],
  'Amulet': ['C.DMG', 'ATK', 'HP', 'DEF'],
  'Banner': ['ACC', 'RES', 'ATK', 'HP', 'DEF'],
};

const getRestrictedSubstats = (gearType: string) => {
  if (gearType === 'Ring') {
    return RAID_STATS.filter(s => !['C.RATE', 'SPD', 'C.DMG', 'RES', 'ACC'].includes(s));
  }
  if (gearType === 'Amulet') {
    return RAID_STATS.filter(s => !['C.RATE', 'SPD', 'HP%', 'ATK%', 'DEF%'].includes(s));
  }
  if (gearType === 'Banner') {
    return RAID_STATS.filter(s => !['C.RATE', 'C.DMG', 'RES', 'ACC'].includes(s));
  }
  return RAID_STATS;
};

export function ManualGearForm({ onSubmit, isAnalyzing, initialData, submitLabel = 'Evaluate Gear' }: ManualGearFormProps) {
  const [type, setType] = useState(initialData?.type || 'Weapon');
  const [set, setSet] = useState(initialData?.set || 'Speed');
  const [faction, setFaction] = useState(initialData?.faction || '');
  const [rank, setRank] = useState(initialData?.rank || '6*');
  const [rarity, setRarity] = useState(initialData?.rarity || 'Legendary');
  const [level, setLevel] = useState('16');
  const [mainStat, setMainStat] = useState(initialData?.mainStat || 'SPD');
  
  const [ascensionStat, setAscensionStat] = useState(() => {
    if (initialData?.ascensionStat) {
      return initialData.ascensionStat.split(' ')[0];
    }
    return '';
  });
  const [ascensionValue, setAscensionValue] = useState(() => {
    if (initialData?.ascensionStat) {
      return initialData.ascensionStat.split(' ')[1] || '';
    }
    return '';
  });
  
  const [substats, setSubstats] = useState(() => {
    if (initialData?.substats) {
      return initialData.substats.map((s: string, i: number) => {
        const parts = s.split(' ');
        const type = parts[0];
        const value = parts[1]?.replace('%', '') || '';
        const enchant = initialData.substatEnchants?.[i]?.toString() || '';
        return { type, value, enchant };
      });
    }
    return [
      { type: 'C.RATE', value: '', enchant: '', rolls: 0 },
      { type: 'C.DMG', value: '', enchant: '', rolls: 0 },
      { type: 'ATK%', value: '', enchant: '', rolls: 0 },
      { type: 'ACC', value: '', enchant: '', rolls: 0 }
    ];
  });

  const allowedMainStats = useMemo(() => ALLOWED_MAIN_STATS[type] || RAID_STATS, [type]);
  const allowedSubstats = useMemo(() => getRestrictedSubstats(type), [type]);

  // Effect to handle stat restrictions when type changes
  useEffect(() => {
    if (!allowedMainStats.includes(mainStat)) {
      setMainStat(allowedMainStats[0]);
    }
    
    // Update substat types if they are no longer allowed
    setSubstats(prev => {
      const needsUpdate = prev.some(s => !allowedSubstats.includes(s.type));
      if (!needsUpdate) return prev;
      
      return prev.map(s => {
        if (!allowedSubstats.includes(s.type)) {
          return { ...s, type: allowedSubstats[0] };
        }
        return s;
      });
    });
  }, [type, allowedMainStats, allowedSubstats, mainStat]);

  // Calculate visible substats based on rarity and level
  const getVisibleSubstatsCount = () => {
    const lvl = parseInt(level);
    let base = 0;
    if (rarity === 'Mythical' || rarity === 'Legendary') base = 4;
    else if (rarity === 'Epic') base = 3;
    else if (rarity === 'Rare') base = 2;
    else if (rarity === 'Uncommon') base = 1;
    else if (rarity === 'Common') base = 0;

    let extra = 0;
    if (rarity === 'Epic' && lvl >= 16) extra = 1;
    else if (rarity === 'Rare') {
      if (lvl >= 16) extra = 2;
      else if (lvl >= 12) extra = 1;
    } else if (rarity === 'Uncommon') {
      if (lvl >= 16) extra = 3;
      else if (lvl >= 12) extra = 2;
      else if (lvl >= 8) extra = 1;
    } else if (rarity === 'Common') {
      if (lvl >= 16) extra = 4;
      else if (lvl >= 12) extra = 3;
      else if (lvl >= 8) extra = 2;
      else if (lvl >= 4) extra = 1;
    }

    return Math.min(4, base + extra);
  };

  const visibleCount = getVisibleSubstatsCount();
  const totalRolls = substats.slice(0, visibleCount).reduce((sum, s) => sum + s.rolls, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeSubstats = substats.slice(0, visibleCount).filter(s => s.value.trim() !== '');
    
    let formattedAscension = undefined;
    if (ascensionStat && ascensionValue) {
      formattedAscension = `${ascensionStat} ${ascensionValue}${['HP%', 'ATK%', 'DEF%', 'C.RATE', 'C.DMG'].includes(ascensionStat) ? '%' : ''}`;
    }

    onSubmit({
      type,
      set,
      faction: ['Ring', 'Amulet', 'Banner'].includes(type) ? faction : undefined,
      rank,
      rarity,
      level: parseInt(level),
      mainStat,
      substats: activeSubstats.map(s => `${s.type} [${s.rolls}] ${s.value}${s.type.includes('%') || ['C.RATE', 'C.DMG'].includes(s.type) ? '%' : ''}`),
      substatEnchants: activeSubstats.map(s => parseInt(s.enchant) || 0),
      ascensionStat: formattedAscension
    });
  };

  const handleSubstatTypeChange = (index: number, type: string) => {
    const newSubstats = [...substats];
    newSubstats[index].type = type;
    setSubstats(newSubstats);
  };

  const handleSubstatValueChange = (index: number, value: string) => {
    const newSubstats = [...substats];
    newSubstats[index].value = value;
    setSubstats(newSubstats);
  };

  const handleSubstatEnchantChange = (index: number, enchant: string) => {
    const newSubstats = [...substats];
    newSubstats[index].enchant = enchant;
    setSubstats(newSubstats);
  };

  const handleSubstatRollsChange = (index: number, rolls: number) => {
    const newSubstats = [...substats];
    newSubstats[index].rolls = rolls;
    setSubstats(newSubstats);
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (newType === 'Weapon') setMainStat('ATK');
    else if (newType === 'Helmet') setMainStat('HP');
    else if (newType === 'Shield') setMainStat('DEF');

    if (['Ring', 'Amulet', 'Banner'].includes(newType)) {
      if (!ACCESSORY_SETS.includes(set)) {
        setSet('Standard');
      }
      if (!faction) {
        setFaction(FACTIONS[0]);
      }
    } else {
      if (ACCESSORY_SETS.includes(set) && set !== 'Standard') {
        setSet('Speed');
      }
    }
  };

  const availableSets = ['Ring', 'Amulet', 'Banner'].includes(type) 
    ? ACCESSORY_SETS 
    : RAID_SETS.filter(s => !ACCESSORY_SETS.includes(s) || s === 'Chronophage' || s === 'Merciless' || s === 'Slayer');
    // Note: Some sets like Chronophage might be available for both? 
    // User said "only chronophage, feral, slayer, merciless and standard" for accessories.
    // I'll stick to that.

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit} 
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Gear Type</label>
              <select
                required
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
              >
                {GEAR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-4 bottom-3 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
            
            <div className="relative">
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Set Name</label>
              <select
                required
                value={set}
                onChange={(e) => setSet(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
              >
                {availableSets.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-4 bottom-3 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {['Ring', 'Amulet', 'Banner'].includes(type) && (
            <div className="relative">
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Faction</label>
              <select
                required
                value={faction}
                onChange={(e) => setFaction(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
              >
                {FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <ChevronDown className="absolute right-4 bottom-3 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Rank</label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
              >
                <option>6*</option>
                <option>5*</option>
                <option>4*</option>
                <option>3*</option>
              </select>
              <ChevronDown className="absolute right-4 bottom-3 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
            <div className="relative">
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Rarity</label>
              <select
                value={rarity}
                onChange={(e) => setRarity(e.target.value)}
                className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none font-bold ${
                  {
                    Mythical: 'text-red-500',
                    Legendary: 'text-orange-500',
                    Epic: 'text-purple-500',
                    Rare: 'text-sky-400',
                  }[rarity] || 'text-zinc-200'
                }`}
              >
                <option className="text-red-500 font-bold">Mythical</option>
                <option className="text-orange-500 font-bold">Legendary</option>
                <option className="text-purple-500 font-bold">Epic</option>
                <option className="text-sky-400 font-bold">Rare</option>
                <option className="text-zinc-400 font-bold">Uncommon</option>
                <option className="text-zinc-500 font-bold">Common</option>
              </select>
              <ChevronDown className="absolute right-4 bottom-3 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
              >
                <option value="0">0</option>
                <option value="4">+4</option>
                <option value="8">+8</option>
                <option value="12">+12</option>
                <option value="16">+16</option>
              </select>
              <ChevronDown className="absolute right-4 bottom-3 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
            <div className="relative">
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">
                Main Stat {['Weapon', 'Helmet', 'Shield'].includes(type) && '(Fixed)'}
              </label>
              <select
                required
                disabled={['Weapon', 'Helmet', 'Shield'].includes(type)}
                value={mainStat}
                onChange={(e) => setMainStat(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {allowedMainStats.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {!['Weapon', 'Helmet', 'Shield'].includes(type) && (
                <ChevronDown className="absolute right-4 bottom-3 w-4 h-4 text-zinc-500 pointer-events-none" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-500 uppercase">Ascension Stat (Optional)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={ascensionStat}
                  onChange={(e) => setAscensionStat(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                >
                  <option value="">None</option>
                  {RAID_STATS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
              <div className="w-24 relative">
                <input
                  type="text"
                  value={ascensionValue}
                  onChange={(e) => setAscensionValue(e.target.value)}
                  placeholder="Value"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-amber-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Substats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-zinc-500 uppercase">Substats ({visibleCount}/4)</label>
            <span className={`text-[10px] font-bold ${totalRolls > 4 ? 'text-red-500' : 'text-zinc-500'}`}>
              Total Rolls: {totalRolls}/4
            </span>
          </div>
          <div className="space-y-3">
            {substats.slice(0, visibleCount).map((sub, i) => (
              <SubstatRow
                key={i}
                index={i}
                type={sub.type}
                value={sub.value}
                enchant={sub.enchant}
                rolls={sub.rolls}
                maxRolls={4 - (totalRolls - sub.rolls)}
                allowedStats={allowedSubstats}
                onTypeChange={(type) => handleSubstatTypeChange(i, type)}
                onValueChange={(val) => handleSubstatValueChange(i, val)}
                onEnchantChange={(val) => handleSubstatEnchantChange(i, val)}
                onRollsChange={(rolls) => handleSubstatRollsChange(i, rolls)}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                {visibleCount === 0 
                  ? "Common gear at level 0 has no substats. Level it up to unlock them!" 
                  : "Select the stat type, enter the value, and select the number of rolls (max 4 total)."}
              </p>
            </div>
            {totalRolls > 4 && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-400 leading-relaxed font-bold">
                  A gear piece can only have a maximum of 4 rolls total across all substats.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800 flex gap-3">
        <button
          type="button"
          onClick={() => {
            setType('Weapon');
            setSet('Speed');
            setRank('6*');
            setRarity('Legendary');
            setLevel('0');
            setMainStat('ATK');
            setFaction('');
            setAscensionStat('');
            setAscensionValue('');
            setSubstats([
              { type: 'C.RATE', value: '', enchant: '', rolls: 0 },
              { type: 'C.DMG', value: '', enchant: '', rolls: 0 },
              { type: 'ATK%', value: '', enchant: '', rolls: 0 },
              { type: 'ACC', value: '', enchant: '', rolls: 0 }
            ]);
          }}
          className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all border border-zinc-800"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={isAnalyzing}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          {isAnalyzing ? (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
