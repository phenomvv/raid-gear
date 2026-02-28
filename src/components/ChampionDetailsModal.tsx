import React, { useState, useMemo } from 'react';
import { X, Shield, Trash2, Plus, User, Activity, Zap, Heart, Sword, Shield as ShieldIcon, Target, Sparkles, Filter, ChevronLeft, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Champion, GearItem, Stats, AnalysisResult } from '../types';
import { ManualGearForm } from './ManualGearForm';
import { evaluateManualGear } from '../services/gemini';
import { DEFAULT_BASE_STATS, parseStat, calculateTotalStats } from '../utils/stats';

interface ChampionDetailsModalProps {
  champion: Champion;
  equippedGear: GearItem[];
  availableGear: GearItem[];
  roster: Champion[];
  onClose: () => void;
  onEquip: (gearId: string, championId: string) => void;
  onUnequip: (gearId: string) => void;
  onAddGear: (item: GearItem) => void;
  onUpdateGear: (item: GearItem) => void;
}

export function ChampionDetailsModal({ 
  champion, 
  equippedGear, 
  availableGear, 
  roster,
  onClose, 
  onEquip, 
  onUnequip,
  onAddGear,
  onUpdateGear
}: ChampionDetailsModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [previewGearId, setPreviewGearId] = useState<string | null>(null);
  const [isAddingGear, setIsAddingGear] = useState(false);
  const [editingGearId, setEditingGearId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const baseStats = champion.baseStats || DEFAULT_BASE_STATS;

  const totalStats = useMemo(() => {
    return calculateTotalStats(baseStats, equippedGear);
  }, [baseStats, equippedGear]);

  const previewStats = useMemo(() => {
    if (!previewGearId) return null;
    const previewItem = availableGear.find(g => g.id === previewGearId);
    if (!previewItem) return null;

    const slotType = previewItem.gearDetails.type;
    // Filter out the item currently in the same slot
    const gearWithPreview = equippedGear.filter(g => g.gearDetails.type !== slotType);
    gearWithPreview.push(previewItem);

    const totals: Stats = { ...baseStats };
    const bonus: Stats = { HP: 0, ATK: 0, DEF: 0, SPD: 0, C_RATE: 0, C_DMG: 0, RES: 0, ACC: 0 };

    gearWithPreview.forEach(item => {
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
  }, [baseStats, equippedGear, availableGear, previewGearId]);

  const filteredGear = useMemo(() => {
    if (!selectedSlot) return availableGear;
    return availableGear.filter(item => item.gearDetails.type === selectedSlot);
  }, [availableGear, selectedSlot]);

  const handleManualSubmit = async (details: {
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
  }) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const rosterNames = roster.map(c => c.name);
      const analysis = await evaluateManualGear(details, rosterNames);
      setAnalysisResult(analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveGear = () => {
    if (!analysisResult) return;
    
    if (editingGearId) {
      const existingItem = equippedGear.find(g => g.id === editingGearId) || availableGear.find(g => g.id === editingGearId);
      if (existingItem) {
        const updatedItem: GearItem = {
          ...existingItem,
          ...analysisResult,
        };
        onUpdateGear(updatedItem);
      }
    } else {
      const item: GearItem = {
        ...analysisResult,
        id: crypto.randomUUID(),
        dateAdded: new Date().toISOString(),
      };
      onAddGear(item);
    }
    
    setIsAddingGear(false);
    setEditingGearId(null);
    setAnalysisResult(null);
    // Auto-select the slot of the new/updated gear to show it in the list
    if (analysisResult) {
      setSelectedSlot(analysisResult.gearDetails.type);
    }
  };

  const renderStatRow = (label: string, key: keyof Stats, icon: React.ReactNode) => {
    const base = baseStats[key];
    const bonus = totalStats.bonus[key];
    const total = totalStats.totals[key];
    const previewTotal = previewStats?.totals[key];
    const isPercentStat = ['C_RATE', 'C_DMG'].includes(key);

    const hasChange = previewTotal !== undefined && previewTotal !== total;
    const isIncrease = previewTotal !== undefined && previewTotal > total;

    return (
      <div className="flex items-center py-1 border-b border-zinc-800/30 last:border-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-zinc-500">{icon}</div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{label}</span>
        </div>
        
        {/* Visual Line */}
        <div className="flex-1 border-b border-zinc-800/30 mx-3 self-end mb-2" />

        <div className="text-right shrink-0">
          <div className={`text-sm font-black leading-tight transition-colors ${
            hasChange ? (isIncrease ? 'text-yellow-400' : 'text-red-500') : 'text-zinc-100'
          }`}>
            {hasChange ? previewTotal : total}{isPercentStat ? '%' : ''}
          </div>
          <div className="text-[9px] font-bold leading-none">
            <span className="text-zinc-500">{base}</span>
            {bonus > 0 && <span className="text-emerald-400 ml-1">+{bonus}</span>}
            {hasChange && (
              <span className={`ml-1 ${isIncrease ? 'text-yellow-400' : 'text-red-500'}`}>
                ({isIncrease ? '+' : ''}{previewTotal - total})
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500/50 bg-zinc-950 shadow-lg shadow-indigo-500/20">
              <img 
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(champion.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                alt={champion.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{champion.name}</h2>
              <p className="text-zinc-400 text-sm font-medium">
                {champion.faction ? `${champion.faction} Faction` : 'Champion Profile'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start justify-center">
            {/* Left Column: Gear Grid */}
            <section className="shrink-0">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                Equipped Gear ({equippedGear.length}/9)
              </h3>
              
              <div className="flex flex-col items-center gap-4">
                {[
                  ['Weapon', 'Helmet', 'Shield'],
                  ['Gauntlets', 'Chestplate', 'Boots'],
                  ['Ring', 'Amulet', 'Banner']
                ].map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-3">
                    {row.map((slotType) => {
                      const item = equippedGear.find(g => g.gearDetails.type === slotType);
                      const isSelected = selectedSlot === slotType;
                      const rarityBorder = item ? {
                        Mythical: 'border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]',
                        Legendary: 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]',
                        Epic: 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
                        Rare: 'border-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.2)]',
                      }[item.gearDetails.rarity] : isSelected ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-800';

                      return (
                        <div key={slotType} className="flex flex-col items-center gap-1.5">
                          <div 
                            className={`w-16 h-16 rounded-xl border-2 bg-zinc-950 flex flex-col items-center justify-center relative group transition-all ${rarityBorder} ${!item ? 'border-dashed cursor-pointer hover:border-indigo-500/50' : 'hover:scale-105 cursor-pointer'}`}
                            onClick={() => {
                              if (item) {
                                onUnequip(item.id);
                              } else {
                                setSelectedSlot(isSelected ? null : slotType);
                              }
                            }}
                          >
                            {!item ? (
                              <div className="flex flex-col items-center gap-1">
                                <Plus className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-zinc-600'}`} />
                                <span className={`text-[7px] font-bold uppercase tracking-tighter ${isSelected ? 'text-indigo-400' : 'text-zinc-600'}`}>{slotType}</span>
                              </div>
                            ) : (
                              <>
                                {item.image ? (
                                  <img src={item.image} alt={slotType} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <span className="text-[9px] font-black text-indigo-400 uppercase">{slotType.slice(0, 3)}</span>
                                    <span className="text-[7px] font-bold text-zinc-500">{item.evaluation.score}</span>
                                  </div>
                                )}
                                
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 rounded-lg transition-opacity">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingGearId(item.id);
                                      setIsAddingGear(true);
                                    }}
                                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors"
                                  >
                                    <Sparkles className="w-4 h-4 text-white" />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onUnequip(item.id);
                                    }}
                                    className="p-1.5 bg-red-600 hover:bg-red-500 rounded-md transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-white" />
                                  </button>
                                </div>

                                <div className="absolute top-0.5 left-0.5 flex gap-0.5">
                                  <div className="text-[6px] font-black text-amber-400 drop-shadow-md">★★★★★★</div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>

            {/* Right Column: Total Stats */}
            <section className="w-full md:w-64 bg-zinc-950/50 rounded-2xl p-4 border border-zinc-800 md:mt-6">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Total Stats
              </h3>
              <div className="space-y-1">
                {renderStatRow('HP', 'HP', <Heart className="w-3 h-3" />)}
                {renderStatRow('ATK', 'ATK', <Sword className="w-3 h-3" />)}
                {renderStatRow('DEF', 'DEF', <ShieldIcon className="w-3 h-3" />)}
                {renderStatRow('SPD', 'SPD', <Zap className="w-3 h-3" />)}
                {renderStatRow('C. Rate', 'C_RATE', <Target className="w-3 h-3" />)}
                {renderStatRow('C. DMG', 'C_DMG', <Sparkles className="w-3 h-3" />)}
                {renderStatRow('RES', 'RES', <Shield className="w-3 h-3" />)}
                {renderStatRow('ACC', 'ACC', <Target className="w-3 h-3" />)}
              </div>
            </section>
          </div>

          {/* Available Gear */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  Assign from Inventory {selectedSlot && <span className="text-indigo-400 ml-1">({selectedSlot}s)</span>}
                </h3>
                <button 
                  onClick={() => setIsAddingGear(!isAddingGear)}
                  className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                    isAddingGear 
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-300' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {isAddingGear ? (
                    <>
                      <ChevronLeft className="w-3 h-3" />
                      Back to List
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      Add New Gear
                    </>
                  )}
                </button>
              </div>
              {selectedSlot && !isAddingGear && (
                <button 
                  onClick={() => setSelectedSlot(null)}
                  className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                >
                  <Filter className="w-3 h-3" />
                  Clear Filter
                </button>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {isAddingGear ? (
                <motion.div
                  key="add-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {!analysisResult ? (
                    <ManualGearForm 
                      onSubmit={handleManualSubmit} 
                      isAnalyzing={isAnalyzing} 
                      initialData={editingGearId ? (equippedGear.find(g => g.id === editingGearId)?.gearDetails || availableGear.find(g => g.id === editingGearId)?.gearDetails) : undefined}
                      submitLabel={editingGearId ? 'Update Gear' : 'Evaluate Gear'}
                    />
                  ) : (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Evaluation Result</p>
                          <h4 className={`text-2xl font-black ${
                            analysisResult.evaluation.verdict === 'KEEP' ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {analysisResult.evaluation.verdict} ({analysisResult.evaluation.score}/100)
                          </h4>
                        </div>
                        <button 
                          onClick={() => setAnalysisResult(null)}
                          className="text-xs font-bold text-zinc-500 hover:text-zinc-300"
                        >
                          Edit Details
                        </button>
                      </div>
                      
                      <p className="text-sm text-zinc-400 leading-relaxed italic">
                        "{analysisResult.evaluation.reasoning}"
                      </p>

                      {/* Analysis Result Stats */}
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">Main Stat</span>
                          <span className="text-sm font-bold text-indigo-400">{analysisResult.gearDetails.mainStat}</span>
                        </div>

                        {analysisResult.gearDetails.faction && (
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Faction</span>
                            <span className="text-xs font-bold text-amber-500">{analysisResult.gearDetails.faction}</span>
                          </div>
                        )}
                        
                        {analysisResult.gearDetails.ascensionStat && (
                          <div className="flex justify-between items-center bg-zinc-900/50 px-3 py-2 rounded-lg border border-indigo-500/20">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              <span className="text-[10px] font-bold text-zinc-400 uppercase">Ascension</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-indigo-300">{analysisResult.gearDetails.ascensionStat.split(' ')[0]}</span>
                              <input 
                                type="text"
                                value={analysisResult.gearDetails.ascensionStat.split(' ')[1]?.replace('%', '') || ''}
                                onChange={(e) => {
                                  const parts = analysisResult.gearDetails.ascensionStat!.split(' ');
                                  const newVal = e.target.value;
                                  const suffix = parts[1]?.includes('%') ? '%' : '';
                                  setAnalysisResult({
                                    ...analysisResult,
                                    gearDetails: {
                                      ...analysisResult.gearDetails,
                                      ascensionStat: `${parts[0]} ${newVal}${suffix}`
                                    }
                                  });
                                }}
                                className="w-12 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-indigo-400 font-bold text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">Substats & Enchants</span>
                          {analysisResult.gearDetails.substats.map((sub, i) => {
                            const enchants = [...(analysisResult.gearDetails.substatEnchants || [0, 0, 0, 0])];
                            const enchant = enchants[i] || 0;
                            return (
                              <div key={i} className="flex justify-between items-center text-xs font-mono bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800/30 group">
                                <span className="text-zinc-300">{sub}</span>
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-3 h-3 text-amber-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                                  <input 
                                    type="text"
                                    value={enchant || ''}
                                    placeholder="0"
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      const newEnchants = [...enchants];
                                      newEnchants[i] = val;
                                      setAnalysisResult({
                                        ...analysisResult,
                                        gearDetails: {
                                          ...analysisResult.gearDetails,
                                          substatEnchants: newEnchants
                                        }
                                      });
                                    }}
                                    className="w-10 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-amber-400 font-bold text-center focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-zinc-800"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={handleSaveGear}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        Save & Add to Inventory
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="gear-list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {filteredGear.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-zinc-800 rounded-2xl text-center">
                      <p className="text-zinc-500 text-sm">
                        {selectedSlot 
                          ? `No unassigned ${selectedSlot}s available.` 
                          : "No unassigned gear available in inventory."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredGear.map((item) => {
                        const isPreviewed = previewGearId === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (isPreviewed) {
                                onEquip(item.id, champion.id);
                                setPreviewGearId(null);
                              } else {
                                setPreviewGearId(item.id);
                              }
                            }}
                            className={`bg-zinc-900 border rounded-xl p-3 flex items-center justify-between hover:bg-zinc-800/50 transition-all text-left group ${
                              isPreviewed ? 'border-yellow-500 bg-yellow-500/5' : 'border-zinc-800 hover:border-indigo-500/50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-lg bg-zinc-950 border flex items-center justify-center shrink-0 ${
                                isPreviewed ? 'border-yellow-500' : 'border-zinc-800'
                              }`}>
                                <span className={`text-[10px] font-bold ${isPreviewed ? 'text-yellow-400' : 'text-zinc-500 group-hover:text-indigo-400'}`}>
                                  {(item.gearDetails.type || '?').charAt(0)}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-zinc-200 truncate">
                                  {item.gearDetails.type || 'Unknown'} - {item.gearDetails.set}
                                  {item.gearDetails.faction && <span className="text-amber-500 ml-1">({item.gearDetails.faction})</span>}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-[10px] text-zinc-500">{item.gearDetails.mainStat} • +{item.gearDetails.level || 0} • {item.evaluation.score} pts</p>
                                  {item.gearDetails.substatEnchants?.some(e => e > 0) && (
                                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isPreviewed ? (
                                <span className="text-[8px] font-black text-yellow-500 uppercase tracking-tighter bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                                  Confirm
                                </span>
                              ) : (
                                <Plus className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-800/20">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
