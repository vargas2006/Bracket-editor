import React, { useState } from 'react';
import type { Team } from '../../types';
import { X, GitBranch, CheckSquare, Square, Shuffle } from 'lucide-react';

interface BracketSettingsModalProps {
  isOpen: boolean;
  teams: Team[];
  onClose: () => void;
  onGenerate: (size: 4 | 8 | 16, selectedTeamIds: string[], hasThirdPlace: boolean) => void;
}

export const BracketSettingsModal: React.FC<BracketSettingsModalProps> = ({
  isOpen,
  teams,
  onClose,
  onGenerate,
}) => {
  if (!isOpen) return null;

  const [size, setSize] = useState<4 | 8 | 16>(8);
  const [hasThirdPlace, setHasThirdPlace] = useState(true);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(() => {
    // Default to top teams from leaderboard
    return teams.slice(0, 8).map((t) => t.id);
  });

  const handleSizeChange = (newSize: 4 | 8 | 16) => {
    setSize(newSize);
    // Auto-adjust selected teams to fit new size
    setSelectedTeamIds(teams.slice(0, newSize).map((t) => t.id));
  };

  const handleToggleTeam = (teamId: string) => {
    if (selectedTeamIds.includes(teamId)) {
      setSelectedTeamIds(selectedTeamIds.filter((id) => id !== teamId));
    } else {
      if (selectedTeamIds.length < size) {
        setSelectedTeamIds([...selectedTeamIds, teamId]);
      }
    }
  };

  const handleShuffle = () => {
    const shuffled = [...selectedTeamIds].sort(() => Math.random() - 0.5);
    setSelectedTeamIds(shuffled);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(size, selectedTeamIds, hasThirdPlace);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#131722] border border-slate-700 rounded-xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              Generate Tournament Bracket
            </h3>
            <p className="text-xs text-slate-400">
              Configure single elimination bracket size and select participating ROS Legacy teams.
            </p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Bracket Size selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Number of Teams (Single Elimination)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([4, 8, 16] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSizeChange(s)}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-bold font-mono transition-all ${
                    size === s
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40'
                      : 'bg-[#0b0e14] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {s} Teams
                </button>
              ))}
            </div>
          </div>

          {/* Third Place Match Option */}
          <div className="p-3 rounded-lg bg-[#0b0e15] border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Include 3rd Place Match</span>
              <span className="text-[11px] text-slate-400">
                Pits the two semi-final losers against each other for bronze.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setHasThirdPlace(!hasThirdPlace)}
              className="p-1 text-rose-400 hover:text-rose-300"
            >
              {hasThirdPlace ? (
                <CheckSquare className="w-5 h-5 text-rose-500" />
              ) : (
                <Square className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>

          {/* Seed Teams Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Seeds ({selectedTeamIds.length} / {size})
              </label>
              <button
                type="button"
                onClick={handleShuffle}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Shuffle Seeds
              </button>
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {teams.map((team) => {
                const isSelected = selectedTeamIds.includes(team.id);
                const seedIndex = selectedTeamIds.indexOf(team.id);

                return (
                  <div
                    key={team.id}
                    onClick={() => handleToggleTeam(team.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-rose-500/10 border-rose-500/40 text-white'
                        : 'bg-[#0b0e14] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] w-5 text-slate-500">
                        {isSelected ? `#${seedIndex + 1}` : '-'}
                      </span>
                      <span>{team.logo || '🛡️'}</span>
                      <span className="font-semibold">{team.name}</span>
                    </div>
                    <span className="font-mono text-slate-500">{team.points} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-lg shadow-rose-900/40"
            >
              Generate New Bracket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
