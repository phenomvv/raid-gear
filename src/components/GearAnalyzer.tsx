import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Image as ImageIcon, Loader2, ShieldAlert, ShieldCheck, Swords, Menu, Keyboard, Camera, Sparkles, RotateCcw, ArrowUpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeGear, evaluateManualGear } from '../services/gemini';
import { AnalysisResult, Champion, GearItem } from '../types';
import { ManualGearForm } from './ManualGearForm';

interface GearAnalyzerProps {
  roster: Champion[];
  onOpenSidebar: () => void;
  onSave: (item: GearItem) => void;
  initialMode?: 'upload' | 'manual';
}

export function GearAnalyzer({ roster, onOpenSidebar, onSave, initialMode = 'upload' }: GearAnalyzerProps) {
  const [mode, setMode] = useState<'upload' | 'manual'>(initialMode);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    setImagePreview(null);
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

  const resizeImage = (file: File): Promise<{ base64: string; preview: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          const preview = canvas.toDataURL('image/jpeg', 0.8);
          const base64 = preview.split(',')[1];
          resolve({ base64, preview });
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    setError(null);
    setResult(null);
    setIsSaved(false);
    
    // Analyze
    setIsAnalyzing(true);

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'undefined') {
      setError('Gemini API Key is missing. Please set GEMINI_API_KEY in your environment variables.');
      setIsAnalyzing(false);
      return;
    }

    try {
      const { base64, preview } = await resizeImage(file);
      setImagePreview(preview);

      const rosterNames = roster.map(c => c.name);
      const analysis = await analyzeGear(base64, 'image/jpeg', rosterNames);
      setResult(analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze gear. Please try again.');
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
      image: imagePreview || undefined
    };
    onSave(item);
    setIsSaved(true);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [roster]);

  const onPaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) handleFile(file);
        break;
      }
    }
  }, [roster]);

  useEffect(() => {
    document.addEventListener('paste', onPaste as any);
    return () => document.removeEventListener('paste', onPaste as any);
  }, [onPaste]);

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-4 md:p-8 text-zinc-100">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        
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

        {/* Mode Toggle */}
        <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
          <button
            onClick={() => { setMode('upload'); setResult(null); setError(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'upload' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Camera className="w-4 h-4" />
            Screenshot
          </button>
          <button
            onClick={() => { setMode('manual'); setResult(null); setError(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'manual' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual Entry
          </button>
        </div>

        {mode === 'upload' ? (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-200 ease-in-out
              ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'}
              ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
              <div className="p-4 bg-zinc-800 rounded-full">
                <Upload className="w-8 h-8 text-zinc-400" />
              </div>
              <div>
                <p className="text-lg md:text-xl font-medium mb-1">Click or drag image here</p>
                <p className="text-xs md:text-sm text-zinc-500">You can also paste (Ctrl+V) an image directly</p>
              </div>
            </div>
          </div>
        ) : (
          <ManualGearForm onSubmit={handleManualSubmit} isAnalyzing={isAnalyzing} />
        )}

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
