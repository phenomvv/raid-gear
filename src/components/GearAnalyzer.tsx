import React, { useState } from 'react';
import { Loader2, ShieldCheck, Swords, Menu, Sparkles, RotateCcw, ArrowUpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { evaluateManualGear } from '../services/gemini';
import { AnalysisResult, Champion, GearItem } from '../types';
import { ManualGearForm } from './ManualGearForm';

interface GearAnalyzerProps {
  roster: Champion[];
  onOpenSidebar: () => void;
  onSave: (item: GearItem) => void;
}

export function GearAnalyzer({ roster, onOpenSidebar, onSave }: GearAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

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
    setError(null);
    setResult(null);
    setIsSaved(false);
    setIsAnalyzing(true);

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'undefined') {
      setError('Gemini API Key is missing. Please set GEMINI_API_KEY in your environment variables.');
      setIsAnalyzing(false);
      return;
    }

    try {
      const rosterNames = roster.map(c => c.name);
      const analysis = await evaluateManualGear(details, rosterNames);
      setResult(analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to evaluate gear. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    const item: GearItem = {
      ...result,
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString(),
    };
    onSave(item);
    setIsSaved(true);
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-3 md:p-8 text-zinc-100 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-8">
        
        <header className="flex items-start gap-4">
          <button 
            onClick={onOpenSidebar}
            className="md:hidden p-2 -ml-2 mt-1 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Gear Grader</h1>
            <p className="text-zinc-400 text-base md:text-lg">
              Analyze your Raid: Shadow Legends gear to get an instant evaluation.
            </p>
          </div>
        </header>

        <ManualGearForm onSubmit={handleManualSubmit} isAnalyzing={isAnalyzing} />

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-12 space-y-4"
            >
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-zinc-400 font-medium animate-pulse">Analyzing gear stats and consulting roster...</p>
            </motion.div>
          )}

          {result && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              {/* Analysis Results */}
              <div className="space-y-6">
                {/* Verdict Card */}
                <div className={`p-6 rounded-2xl border ${
                  result.evaluation.verdict === 'KEEP' 
                    ? 'bg-emerald-500/10 border-emerald-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-wider opacity-70 mb-1">Verdict</p>
                      <h2 className={`text-4xl font-black ${
                        result.evaluation.verdict === 'KEEP' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {result.evaluation.verdict}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium uppercase tracking-wider opacity-70 mb-1">Score</p>
                      <div className="text-3xl font-bold font-mono">
                        {result.evaluation.score}<span className="text-lg opacity-50">/100</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90 mb-6">
                    {result.evaluation.reasoning}
                  </p>
                  
                  {result.evaluation.verdict === 'KEEP' && (
                    <button
                      onClick={handleSave}
                      disabled={isSaved}
                      className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        isSaved 
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                      {isSaved ? 'Saved to Inventory' : 'Save to Inventory'}
                    </button>
                  )}
                </div>

                {/* Stats Extracted */}
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-4">Extracted Stats</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Set</p>
                      <p className="font-medium">{result.gearDetails.set}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Rank, Rarity & Level</p>
                      <p className={`font-bold ${
                        {
                          Mythical: 'text-red-500',
                          Legendary: 'text-orange-500',
                          Epic: 'text-purple-500',
                          Rare: 'text-sky-400',
                        }[result.gearDetails.rarity] || 'text-white'
                      }`}>
                        {result.gearDetails.rank} {result.gearDetails.rarity} +{result.gearDetails.level || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-zinc-500 mb-1">Main Stat</p>
                    <p className="font-bold text-lg text-indigo-400">{result.gearDetails.mainStat}</p>
                  </div>
                  {result.gearDetails.ascensionStat && (
                    <div className="mb-4">
                      <p className="text-xs text-zinc-500 mb-1">Ascension Stat</p>
                      <p className="font-bold text-indigo-300">{result.gearDetails.ascensionStat}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-zinc-500 mb-2">Substats</p>
                    <ul className="space-y-1">
                      {result.gearDetails.substats.map((sub, i) => {
                        const enchant = result.gearDetails.substatEnchants?.[i];
                        return (
                          <li key={i} className="text-sm font-mono bg-zinc-950 px-3 py-1.5 rounded-md border border-zinc-800/50 flex justify-between items-center">
                            <span>{sub}</span>
                            {enchant ? (
                              <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                <Sparkles className="w-3 h-3" />
                                +{enchant}
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                {result.evaluation.verdict === 'KEEP' && result.recommendations.length > 0 && (
                  <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
                      <Swords className="w-4 h-4" />
                      Recommended Champions
                    </h3>
                    <div className="space-y-4">
                      {result.recommendations.map((rec, i) => (
                        <div key={i} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
                          <p className="font-bold text-indigo-300 mb-1">{rec.champion}</p>
                          <p className="text-sm text-zinc-400 leading-relaxed">{rec.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhancement Advice */}
                {result.evaluation.verdict === 'KEEP' && result.enhancements && (
                  <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Enhancement Strategy
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-start gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
                        <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Enchant (Glyphs)</p>
                          <p className="text-sm text-zinc-200">{result.enhancements.enchant}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
                        <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
                          <RotateCcw className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Rework (Chaos Ore)</p>
                          <p className="text-sm text-zinc-200">{result.enhancements.rework}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
                        <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                          <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Ascend (Oil)</p>
                          <p className="text-sm text-zinc-200">{result.enhancements.ascend}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
