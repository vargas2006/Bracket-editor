import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useTournament();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900/95 border border-rose-500/50 text-slate-100 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
      <Info className="w-4 h-4 text-rose-400" />
      <span className="text-sm font-medium tracking-wide">{toastMessage}</span>
    </div>
  );
};

