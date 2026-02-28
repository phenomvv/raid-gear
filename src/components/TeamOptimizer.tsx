import React, { useState, useMemo } from 'react';
import { Users, Target, Sparkles, AlertCircle, ChevronRight, Loader2, Plus, X, ShieldCheck, Zap, Sword, Shield, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Champion, GearItem, ContentStrategy, Stats } from '../types';
import { optimizeTeam } from '../services/gemini';
import { calculateTotalStats, DEFAULT_BASE_STATS } from '../utils/stats';

interface TeamOptimizerProps {
  roster: Champion[];
  inventory: GearItem[];
}

const CONTENT_OPTIONS = [
  'Clan Boss (Ultra Nightmare)',
  'Clan Boss (Nightmare)',
  'Hydra (Normal)',
  'Hydra (Hard)',
  'Hydra (Brutal)',
  'Hydra (Nightmare)',
  'Doom Tower (Hard)',
  'Iron Twins (Stage 15)',
  'Sand Devil (Stage 25)',
  'Shogun (Stage 25)',
  'Arena (Classic)',
  'Arena (Tag Team)',
];

export function TeamOptimizer({ roster, inventory }: TeamOptimizerProps) {
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [targetContent, setTargetContent] = useState(CONTENT_OPTIONS[0]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [strategy, setStrategy] = useState<ContentStrategy | null>(null);

  const toggleChampion = (id: string) => {
    setSelectedTeam(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const handleOptimize = async () => {
    if (selectedTeam.length === 0) return;
    setIsOptimizing(true);
    try {
      const teamData = selectedTeam.map(id => {
        const champion = roster.find(c => c.id === id)!;
        const equippedGear = inventory.filter(g => g.equippedTo === id);
        const { totals } = calculateTotalStats(champion.baseStats || DEFAULT_BASE_STATS, equippedGear);
        return { champion, totalStats: totals };
      });

      const result = await optimizeTeam(targetContent, teamData);
      setStrategy(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const renderStatComparison = (current: Stats, target: Partial<Stats>) => {
    const stats: { key: keyof Stats; label: string; icon: React.ReactNode }[] = [
      { key: 'HP', label: 'HP', icon: <Heart className="w-2.5 h-2.5" /> },
      { key: 'ATK', label: 'ATK', icon: <Sword className="w-2.5 h-2.5" /> },
      { key: 'DEF', label: 'DEF', icon: <Shield className="w-2.5 h-2.5" /> },
      { key: 'SPD', label: 'SPD', icon: <Zap className="w-2.5 h-2.5" /> },
      { key: 'C_RATE', label: 'C. Rate', icon: <Target className="w-2.5 h-2.5" /> },
      { key: 'C_DMG', label: 'C. DMG', icon: <Sparkles className="w-2.5 h-2.5" /> },
      { key: 'RES', label: 'RES', icon: <Shield className="w-2.5 h-2.5" /> },
      { key: 'ACC', label: 'ACC', icon: <Target className="w-2.5 h-2.5" /> },
    ];
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
        {stats.map(({ key, label, icon }) => {
          const curVal = current[key];
          const tarVal = target[key];
          if (tarVal === undefined) return null;

          const isMet = curVal >= tarVal;
          const diff = tarVal - curVal;

          return (
            <div key={key} className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-zinc-500">{icon}</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">{label}</span>
                </div>
                {isMet ? (
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-xs font-bold ${isMet ? 'text-zinc-100' : 'text-amber-400'}`}>{curVal}</span>
                <span className="text-[9px] text-zinc-500">/ {tarVal}</span>
              </div>
              {!isMet && (
                <div className="text-[8px] font-medium text-amber-500/80 mt-0.5">
                  Need +{diff}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Team Optimizer</h1>
          <p className="text-zinc-400 text-base md:text-lg">
            Select your team and target content to get AI-powered stat recommendations.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Target Content</label>
                <div className="relative">
                  <select 
                    value={targetContent}
                    onChange={(e) => setTargetContent(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                  >
                    {CONTENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 rotate-90 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">
                  Select Team ({selectedTeam.length}/5)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {selectedTeam.map(id => {
                    const champ = roster.find(c => c.id === id);
                    return (
                      <div key={id} className="relative group flex flex-col items-center gap-1">
                        <div className="aspect-square w-full rounded-xl overflow-hidden border-2 border-indigo-500 bg-zinc-950 shadow-lg shadow-indigo-500/10">
                          <img 
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(champ?.name || '')}`} 
                            className="w-full h-full object-cover"
                            alt={champ?.name}
                          />
                        </div>
                        <span className="text-[8px] font-bold text-zinc-400 truncate w-full text-center">{champ?.name}</span>
                        {champ?.faction && (
                          <span className="text-[7px] text-zinc-600 uppercase tracking-tighter truncate w-full text-center">{champ.faction}</span>
                        )}
                        <button 
                          onClick={() => toggleChampion(id)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                  {Array.from({ length: 5 - selectedTeam.length }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="aspect-square w-full rounded-xl border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 bg-zinc-950/50">
                        <Plus className="w-6 h-6" />
                      </div>
                      <span className="text-[8px] font-bold text-zinc-800 uppercase">Empty</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleOptimize}
                disabled={selectedTeam.length === 0 || isOptimizing}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Team...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Optimize Stats
                  </>
                )}
              </button>
            </section>

            <section>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Your Roster</h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {roster.map(champ => {
                  const isSelected = selectedTeam.includes(champ.id);
                  return (
                    <div key={champ.id} className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => toggleChampion(champ.id)}
                        className={`aspect-square w-full rounded-xl overflow-hidden border-2 transition-all relative group ${
                          isSelected ? 'border-indigo-500 scale-95 shadow-lg shadow-indigo-500/20' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900'
                        }`}
                      >
                        <img 
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(champ.name)}`} 
                          className="w-full h-full object-cover"
                          alt={champ.name}
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-white drop-shadow-lg" />
                          </div>
                        )}
                      </button>
                      <span className={`text-[9px] font-bold text-center truncate w-full transition-colors ${
                        isSelected ? 'text-indigo-400' : 'text-zinc-500'
                      }`}>
                        {champ.name}
                      </span>
                      {champ.faction && (
                        <span className="text-[7px] text-zinc-600 uppercase tracking-tighter truncate w-full text-center">{champ.faction}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {strategy ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-6 h-6 text-indigo-400" />
                      <h2 className="text-xl font-black">Team Synergy Advice</h2>
                    </div>
                    <p className="text-zinc-300 leading-relaxed italic">
                      "{strategy.teamSynergyAdvice}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    {strategy.recommendations.map((rec, idx) => {
                      const champion = roster.find(c => c.id === rec.championId);
                      return (
                        <motion.div
                          key={rec.championId}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-800">
                                <img 
                                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(champion?.name || '')}`} 
                                  alt={champion?.name}
                                />
                              </div>
                              <div>
                                <h3 className="font-black text-lg">{champion?.name}</h3>
                                <div className="flex items-center gap-2">
                                  {champion?.faction && (
                                    <span className="text-[9px] text-amber-500/80 font-bold uppercase tracking-widest">{champion.faction}</span>
                                  )}
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                    rec.priority === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                    rec.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  }`}>
                                    {rec.priority} Priority
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                            {rec.advice}
                          </p>

                          {renderStatComparison(rec.currentStats, rec.targetStats)}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/30 text-center px-6">
                  <div className="p-4 bg-zinc-800 rounded-full mb-4">
                    <Target className="w-8 h-8 text-zinc-500" />
                  </div>
                  <h3 className="text-zinc-300 font-bold text-lg mb-2">Ready to Optimize?</h3>
                  <p className="text-zinc-500 text-sm max-w-md">
                    Select up to 5 champions from your roster and choose the content you want to conquer. Our AI will analyze your current stats and provide a roadmap to success.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
