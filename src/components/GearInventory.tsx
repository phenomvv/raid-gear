import React from 'react';
import { Trash2, Calendar, Star, TrendingUp, User, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GearItem } from '../types';

interface GearInventoryProps {
  inventory: GearItem[];
  onRemove: (id: string) => void;
  onAddManual: () => void;
}

export function GearInventory({ inventory, onRemove, onAddManual }: GearInventoryProps) {
  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-4 md:p-8 text-zinc-100">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Gear Inventory</h1>
            <p className="text-zinc-400 text-base md:text-lg">
              Your collection of high-quality gear kept from previous analyses.
            </p>
          </div>
          <button
            onClick={onAddManual}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Gear Manually
          </button>
        </header>

        {inventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/30">
            <div className="p-4 bg-zinc-800 rounded-full mb-4">
              <Star className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="text-zinc-400 font-medium mb-4">Your inventory is empty.</p>
            <button
              onClick={onAddManual}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add your first piece manually
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence mode="popLayout">
              {inventory.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col group relative"
                >
                  {/* Compact Header */}
                  <div className="p-1.5 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30">
                    <div className="flex items-center gap-1 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span className="font-bold text-[9px] tracking-wide uppercase truncate">{item.gearDetails.set}</span>
                    </div>
                    <span className="text-[9px] font-mono text-indigo-400 font-bold shrink-0">
                      {item.evaluation.score}
                    </span>
                  </div>

                  {/* Main Info */}
                  <div className="p-1.5 flex gap-1.5">
                    {item.image && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-800 shrink-0">
                        <img src={item.image} alt="Gear" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-indigo-300 text-[9px] truncate leading-tight">{item.gearDetails.mainStat}</p>
                      <p className="text-[8px] text-zinc-500 mt-0.5 uppercase font-bold truncate">
                        {item.gearDetails.rank} • {item.gearDetails.rarity}
                      </p>
                    </div>
                  </div>

                  {/* Substats - Compact Grid */}
                  <div className="px-1.5 pb-1.5">
                    <div className="grid grid-cols-1 gap-0.5">
                      {item.gearDetails.substats.slice(0, 4).map((sub, i) => (
                        <div key={i} className="text-[8px] bg-zinc-950 px-1 py-0.5 rounded border border-zinc-800/30 text-zinc-400 font-mono truncate leading-tight">
                          {sub}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations - Very Compact */}
                  {item.recommendations.length > 0 && (
                    <div className="px-1.5 pb-1.5 mt-auto">
                      <div className="flex flex-wrap gap-0.5">
                        {item.recommendations.slice(0, 2).map((rec, i) => (
                          <div key={i} className="flex items-center gap-0.5 bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700/30">
                            <User className="w-1.5 h-1.5 text-indigo-400" />
                            <span className="text-[7px] font-bold text-zinc-300 truncate max-w-[35px]">{rec.champion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hover Delete Action */}
                  <button
                    onClick={() => onRemove(item.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 rounded-md transition-all hover:bg-red-500 hover:text-white"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
