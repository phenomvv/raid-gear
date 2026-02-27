import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Send, Info, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RAID_STATS, RAID_SETS, GEAR_TYPES } from '../constants';

interface ManualGearFormProps {
  onSubmit: (details: {
    type: string;
    set: string;
    rank: string;
    rarity: string;
    mainStat: string;
    substats: string[];
  }) => void;
  isAnalyzing: boolean;
}

interface SubstatRowProps {
  type: string;
  value: string;
  onTypeChange: (type: string) => void;
  onValueChange: (val: string) => void;
  index: number;
  key?: React.Key;
}

function SubstatRow({ 
  type, 
  value, 
  onTypeChange, 
  onValueChange,
  index 
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
      className="group relative flex items-center bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all"
    >
      {/* Stat Type Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900 border-r border-zinc-800 hover:bg-zinc-800 transition-colors text-xs font-bold text-indigo-400 min-w-[80px] justify-between"
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
              {RAID_STATS.map((stat) => (
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

      {/* Value Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="Value"
        className="flex-1 bg-transparent px-4 py-2.5 text-sm focus:outline-none placeholder:text-zinc-700"
      />
    </motion.div>
  );
}

export function ManualGearForm({ onSubmit, isAnalyzing }: ManualGearFormProps) {
  const [type, setType] = useState('Weapon');
  const [set, setSet] = useState('Speed');
  const [rank, setRank] = useState('6*');
  const [rarity, setRarity] = useState('Legendary');
  const [level, setLevel] = useState('0');
  const [mainStat, setMainStat] = useState('SPD');
  const [substats, setSubstats] = useState([
    { type: 'C.RATE', value: '' },
    { type: 'C.DMG', value: '' },
    { type: 'ATK%', value: '' },
    { type: 'ACC', value: '' }
  ]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      set,
      rank,
      rarity,
      mainStat,
      substats: substats
        .slice(0, visibleCount)
        .filter(s => s.value.trim() !== '')
        .map(s => `${s.type} ${s.value}`)
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
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
              >
                {RAID_SETS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-4 bottom-3 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Rank</label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
              >
                <option>Mythical</option>
                <option>Legendary</option>
                <option>Epic</option>
                <option>Rare</option>
                <option>Uncommon</option>
                <option>Common</option>
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
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
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Main Stat</label>
              <select
                required
                value={mainStat}
                onChange={(e) => setMainStat(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
              >
                {RAID_STATS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-4 bottom-3 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Substats */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Substats ({visibleCount}/4)</label>
          <div className="space-y-3">
            {substats.slice(0, visibleCount).map((sub, i) => (
              <SubstatRow
                key={i}
                index={i}
                type={sub.type}
                value={sub.value}
                onTypeChange={(type) => handleSubstatTypeChange(i, type)}
                onValueChange={(val) => handleSubstatValueChange(i, val)}
              />
            ))}
          </div>
          <div className="flex items-start gap-2 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              {visibleCount === 0 
                ? "Common gear at level 0 has no substats. Level it up to unlock them!" 
                : "Select the stat type and enter the value. Example: 'SPD' and '12'."}
            </p>
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
            setMainStat('SPD');
            setSubstats([
              { type: 'C.RATE', value: '' },
              { type: 'C.DMG', value: '' },
              { type: 'ATK%', value: '' },
              { type: 'ACC', value: '' }
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
              Evaluating...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Evaluate Gear
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
