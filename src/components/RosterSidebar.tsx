import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Users, Search, ChevronDown } from 'lucide-react';
import { Champion, Stats } from '../types';
import { POPULAR_CHAMPIONS, ChampionData, FACTIONS } from '../constants';

const generateBaseStats = (): Stats => ({
  HP: 12000 + Math.floor(Math.random() * 8000),
  ATK: 800 + Math.floor(Math.random() * 600),
  DEF: 800 + Math.floor(Math.random() * 600),
  SPD: 90 + Math.floor(Math.random() * 25),
  C_RATE: 15,
  C_DMG: 50,
  RES: 30,
  ACC: 0
});

interface RosterSidebarProps {
  roster: Champion[];
  setRoster: React.Dispatch<React.SetStateAction<Champion[]>>;
  isOpen: boolean;
  onClose: () => void;
  onSelectChampion: (champion: Champion) => void;
}

export function RosterSidebar({ roster, setRoster, isOpen, onClose, onSelectChampion }: RosterSidebarProps) {
  const [newChamp, setNewChamp] = useState('');
  const [selectedFaction, setSelectedFaction] = useState(FACTIONS[0]);
  const [suggestions, setSuggestions] = useState<ChampionData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (newChamp.trim().length > 1) {
      const filtered = POPULAR_CHAMPIONS.filter(c => 
        c.name.toLowerCase().includes(newChamp.toLowerCase()) &&
        !roster.some(r => r.name.toLowerCase() === c.name.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [newChamp, roster]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = (name: string, faction?: string) => {
    if (!name.trim()) return;
    
    const newChampion: Champion = {
      id: crypto.randomUUID(),
      name: name.trim(),
      faction: faction,
      baseStats: generateBaseStats()
    };
    
    setRoster([...roster, newChampion]);
    setNewChamp('');
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd(newChamp, selectedFaction);
  };

  const handleRemove = (id: string) => {
    setRoster(roster.filter(c => c.id !== id));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" 
          onClick={onClose}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-50 w-full md:w-80 bg-zinc-900 border-r border-zinc-800 h-screen flex flex-col text-zinc-100 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} pl-[env(safe-area-inset-left)]`}>
        <div className="p-6 border-b border-zinc-800 flex justify-between items-start pt-[calc(1.5rem+env(safe-area-inset-top))]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-bold tracking-tight">Your Roster</h2>
            </div>
            <p className="text-sm text-zinc-400">
              Add champions to get personalized gear recommendations.
            </p>
          </div>
          <button onClick={onClose} className="md:hidden text-zinc-400 hover:text-zinc-100 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

      <div className="p-4 border-b border-zinc-800 relative" ref={suggestionRef}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={newChamp}
              onChange={(e) => setNewChamp(e.target.value)}
              onFocus={() => newChamp.length > 1 && setShowSuggestions(true)}
              placeholder="Champion Name..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleAdd(suggestion.name, suggestion.faction)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold">{suggestion.name}</span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{suggestion.faction}</span>
                    </div>
                    <Plus className="w-3 h-3 text-zinc-500 group-hover:text-indigo-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={selectedFaction}
                onChange={(e) => setSelectedFaction(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
              >
                {FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={!newChamp.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors shrink-0 flex items-center gap-2 text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {roster.length === 0 ? (
          <div className="text-center text-zinc-500 mt-10 text-sm">
            No champions added yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {roster.map((champ) => (
              <li
                key={champ.id}
                className="flex items-center justify-between bg-zinc-800/50 rounded-xl px-3 py-2.5 group hover:bg-zinc-800 transition-all border border-zinc-800/50 hover:border-zinc-700 cursor-pointer"
                onClick={() => onSelectChampion(champ)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(champ.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                      alt={champ.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight">{champ.name}</span>
                    {champ.faction && (
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-medium">{champ.faction}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(champ.id);
                  }}
                  className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    </>
  );
}
