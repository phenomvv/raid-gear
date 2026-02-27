import React, { useState, useEffect } from 'react';
import { RosterSidebar } from './components/RosterSidebar';
import { GearAnalyzer } from './components/GearAnalyzer';
import { GearInventory } from './components/GearInventory';
import { Champion, GearItem } from './types';
import { LayoutGrid, Shield, Swords } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'inventory'>('analyzer');
  const [analyzerMode, setAnalyzerMode] = useState<'upload' | 'manual'>('upload');
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

  const removeFromInventory = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden font-sans">
      <RosterSidebar roster={roster} setRoster={setRoster} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 md:px-8 py-3 flex items-center justify-between">
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
          ) : (
            <GearInventory 
              inventory={inventory} 
              onRemove={removeFromInventory} 
              onAddManual={() => {
                setAnalyzerMode('manual');
                setActiveTab('analyzer');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
