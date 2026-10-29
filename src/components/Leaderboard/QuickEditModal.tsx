import React, { useState } from 'react';
import type { Team, Player } from '../../types';
import { X, Crown, Plus, Trash2, Trophy, Gift, Users } from 'lucide-react';

interface QuickEditModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Team>) => void;
}

export const QuickEditModal: React.FC<QuickEditModalProps> = ({
  team,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !team) return null;

  const [name, setName] = useState(team.name);
  const [tag, setTag] = useState(team.tag || '');
  const [logo] = useState(team.logo || '🛡️');
  const [points, setPoints] = useState(team.points);
  const [prize, setPrize] = useState(team.prize || '');
  const [wins, setWins] = useState(team.wins || 0);
  const [kills, setKills] = useState(team.kills || 0);
  const [members, setMembers] = useState<Player[]>(team.members || []);

  const handleAddPlayer = () => {
    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ign: `Player_${members.length + 1}`,
      isCaptain: members.length === 0, // First member is captain by default
      role: 'Fragger',
    };
    setMembers([...members, newPlayer]);
  };

  const handleUpdatePlayer = (index: number, updates: Partial<Player>) => {
    setMembers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...updates } : p))
    );
  };

  const handleSetCaptain = (index: number) => {
    setMembers((prev) =>
      prev.map((p, i) => ({
        ...p,
        isCaptain: i === index,
      }))
    );
  };

  const handleRemovePlayer = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(team.id, {
      name: name.trim() || team.name,
      tag: tag.trim() || undefined,
      logo,
      points: Number(points) || 0,
      prize: prize.trim() || '—',
      wins: Number(wins) || 0,
      kills: Number(kills) || 0,
      members,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#131722] border border-slate-700 rounded-xl p-6 shadow-2xl text-slate-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>Edit Team — {team.name}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0b0e14] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Tag (Initials)
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. ZE"
                className="w-full px-3 py-2 bg-[#0b0e14] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Points
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#0b0e14] border border-slate-700 rounded-lg text-amber-300 font-bold font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-emerald-400" />
                Prize
              </label>
              <input
                type="text"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                placeholder="e.g. ₱1,000 or —"
                className="w-full px-3 py-2 bg-[#0b0e14] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Wins
              </label>
              <input
                type="number"
                value={wins}
                onChange={(e) => setWins(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#0b0e14] border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Kills
              </label>
              <input
                type="number"
                value={kills}
                onChange={(e) => setKills(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#0b0e14] border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Roster editor */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-rose-400" />
                Player Roster ({members.length})
              </label>
              <button
                type="button"
                onClick={handleAddPlayer}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Player
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 bg-[#0a0d13] p-2 rounded-lg border border-slate-800"
                >
                  <button
                    type="button"
                    title={member.isCaptain ? 'Current Captain' : 'Click to make Captain'}
                    onClick={() => handleSetCaptain(index)}
                    className={`p-1.5 rounded ${
                      member.isCaptain
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <Crown className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={member.ign}
                    onChange={(e) => handleUpdatePlayer(index, { ign: e.target.value })}
                    placeholder="Player IGN"
                    required
                    className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                  />

                  <input
                    type="text"
                    value={member.role || ''}
                    onChange={(e) => handleUpdatePlayer(index, { role: e.target.value })}
                    placeholder="Role (e.g. Sniper)"
                    className="w-28 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-rose-500"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(index)}
                    className="p-1.5 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors shadow-lg shadow-rose-900/40"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
