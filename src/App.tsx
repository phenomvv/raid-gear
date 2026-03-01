import React, { useState, useEffect } from 'react';
import { RosterSidebar } from './components/RosterSidebar';
import { GearAnalyzer } from './components/GearAnalyzer';
import { GearInventory } from './components/GearInventory';
import { ChampionDetailsModal } from './components/ChampionDetailsModal';
import { TeamOptimizer } from './components/TeamOptimizer';
import { Champion, GearItem } from './types';
import { LayoutGrid, Shield, Swords, Target } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'inventory' | 'optimizer'>('analyzer');
  const [analyzerMode, setAnalyzerMode] = useState<'upload' | 'manual'>('upload');
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [roster, setRoster] = useState<Champion[]>(() => {
    const saved = localStorage.getItem('raid_roster');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [inventory, setInventory] = useState<GearItem[]>(() => {
    const saved = localStorage.getItem('raid_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('raid_roster', JSON.stringify(roster));
  }, [roster]);

  useEffect(() => {
    localStorage.setItem('raid_inventory', JSON.stringify(inventory));
  }, [inventory]);

  const addToInventory = (item: GearItem) => {
    setInventory(prev => [item, ...prev]);
  };

  const updateGear = (updatedItem: GearItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const removeFromInventory = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const equipGear = (gearId: string, championId: string) => {
    setInventory(prev => prev.map(item => 
      item.id === gearId ? { ...item, equippedTo: championId } : item
    ));
  };

  const unequipGear = (gearId: string) => {
    setInventory(prev => prev.map(item => 
      item.id === gearId ? { ...item, equippedTo: undefined } : item
    ));
  };

  return (
    <div className="fixed inset-0 flex h-full w-full bg-zinc-950 overflow-hidden font-sans select-none">
      <RosterSidebar 
        roster={roster} 
        setRoster={setRoster} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onSelectChampion={setSelectedChampion}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 md:px-8 py-3 flex items-center justify-between pt-[calc(0.75rem+env(safe-area-inset-top))]">
          <div className="flex items-center gap-1 md:gap-4">
            <button 
              onClick={() => setActiveTab('analyzer')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analyzer' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span className="hidden sm:inline">Analyzer</span>
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'inventory' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
              {inventory.length > 0 && (
                <span className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                  {inventory.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('optimizer')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'optimizer' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Optimizer</span>
            </button>
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-zinc-400 hover:text-zinc-100"
            >
              <LayoutGrid className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'analyzer' ? (
            <GearAnalyzer 
              roster={roster} 
              onOpenSidebar={() => setIsSidebarOpen(true)} 
              onSave={addToInventory}
              initialMode={analyzerMode}
            />
          ) : activeTab === 'inventory' ? (
            <GearInventory 
              inventory={inventory} 
              roster={roster}
              onRemove={removeFromInventory} 
              onAddManual={() => {
                setAnalyzerMode('manual');
                setActiveTab('analyzer');
              }}
            />
          ) : (
            <TeamOptimizer 
              roster={roster}
              inventory={inventory}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedChampion && (
          <ChampionDetailsModal
            champion={selectedChampion}
            equippedGear={inventory.filter(i => i.equippedTo === selectedChampion.id)}
            availableGear={inventory.filter(i => !i.equippedTo)}
            roster={roster}
            onClose={() => setSelectedChampion(null)}
            onEquip={equipGear}
            onUnequip={unequipGear}
            onAddGear={addToInventory}
            onUpdateGear={updateGear}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
