import React, { useState } from 'react';
import type { Team, Player } from '../../types';
import { X, Crown, Plus, Trash2, Users, Shield } from 'lucide-react';

interface TeamModalProps {
  team?: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (teamData: Omit<Team, 'id'>) => void;
}

const LOGO_PRESETS = ['👑', '⚡', '🔥', '💀', '🛡️', '🌘', '🐺', '👻', '🦅', '🎯', '⚔️', '🐲'];

export const TeamModal: React.FC<TeamModalProps> = ({
  team,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const isEditing = !!team;

  const [name, setName] = useState(team?.name || '');
  const [tag, setTag] = useState(team?.tag || '');
  const [logo, setLogo] = useState(team?.logo || '🛡️');
  const [members, setMembers] = useState<Player[]>(
    team?.members || [
      { id: `p-${Date.now()}-1`, ign: 'Leader_IGN', isCaptain: true, role: 'IGL' },
      { id: `p-${Date.now()}-2`, ign: 'Sniper_IGN', isCaptain: false, role: 'Sniper' },
    ]
  );

  const handleAddPlayer = () => {
    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ign: `Player_${members.length + 1}`,
      isCaptain: members.length === 0,
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
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      tag: tag.trim() || undefined,
      logo,
      points: team?.points || 0,
      prize: team?.prize || '—',
      wins: team?.wins || 0,
      kills: team?.kills || 0,
      matchesPlayed: team?.matchesPlayed || 0,
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

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              {isEditing ? `Edit Team — ${team.name}` : 'Register New Team'}
            </h3>
            <p className="text-xs text-slate-400">
              Configure team profile, members list, and assign the team Captain.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Team Badge Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {LOGO_PRESETS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setLogo(icon)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-all ${
                    logo === icon
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 scale-105 shadow'
                      : 'bg-[#0b0e14] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Team Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ZENITH ENTITY"
                required
                className="w-full px-3 py-2 bg-[#0b0e14] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Team Tag
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

          {/* Player Roster Section */}
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

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 bg-[#0a0d13] p-2 rounded-lg border border-slate-800"
                >
                  <button
                    type="button"
                    title={member.isCaptain ? 'Captain' : 'Click to assign Captain'}
                    onClick={() => handleSetCaptain(index)}
                    className={`p-1.5 rounded transition-colors ${
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
                    placeholder="In-Game Name (IGN)"
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
                    disabled={members.length <= 1}
                    onClick={() => handleRemovePlayer(index)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-20"
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
              className="px-4 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-lg shadow-rose-900/40"
            >
              {isEditing ? 'Save Changes' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
